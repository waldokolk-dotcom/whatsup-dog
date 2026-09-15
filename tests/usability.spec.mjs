import { test, expect } from '@playwright/test';

const backendStub = `
window.WHATSUP_DOG_BACKEND={provider:'supabase',enabled:false,url:'',publishableKey:'',photoBucket:'report-photos',maxSharedReports:200,signedPhotoSeconds:3600};
function loadWhatsupDogSupportScript(selector,src,datasetKey){
  if(document.querySelector(selector))return;
  const script=document.createElement('script');
  script.src=src;
  script.async=false;
  script.dataset[datasetKey]='1';
  document.body.appendChild(script);
}
loadWhatsupDogSupportScript('script[data-wd-community-ui]','./community-ui-bridge.js?v=1','wdCommunityUi');
loadWhatsupDogSupportScript('script[data-wd-report-lifecycle]','./report-lifecycle.js?v=1','wdReportLifecycle');
loadWhatsupDogSupportScript('script[data-wd-report-photo]','./report-photo.js?v=1.7.0','wdReportPhoto');
`;

async function installSafeRoutes(page,{geocode='success'}={}){
  await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:backendStub}));
  await page.route('https://nominatim.openstreetmap.org/**',route=>{
    if(geocode==='empty') return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{lat:'52.2182',lon:'5.4835',address:{city:'Nijkerk'}}])});
  });
}

async function installDirectoryBackend(page){
  await installSafeRoutes(page);
  await page.route('**/community-backend.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:`
    window.__failDirectoryUpdate=false;
    const directoryClient={
      from:()=>({
        select:()=>({eq:()=>({maybeSingle:async()=>({data:{discoverable:false,breed:null},error:null})})}),
        update:()=>({eq:async()=>window.__failDirectoryUpdate?{error:{message:'network'}}:{error:null}})
      }),
      rpc:async()=>({data:[],error:null})
    };
    window.WhatsupDogCommunity={configured:true,client:directoryClient,user:{id:'00000000-0000-0000-0000-000000000001'}};
  `}));
}

async function seedProfile(page){
  await page.addInitScript(profile=>localStorage.setItem('wd_profile_v1',JSON.stringify(profile)),{
    name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',homeLat:52.2182,homeLng:5.4835,createdAt:'2026-09-14T00:00:00.000Z'
  });
}

async function seedSpeciesProfile(page,speciesContext){
  await page.addInitScript(profile=>localStorage.setItem('wd_profile_v1',JSON.stringify(profile)),{
    name:speciesContext==='cat'?'Luna':speciesContext==='both'?'Boris & Luna':'Boris',avatar:speciesContext==='cat'?'🐈':speciesContext==='both'?'◆':'🐶',speciesContext,homePlace:'Nijkerk',homeLat:52.2182,homeLng:5.4835,createdAt:'2026-09-15T00:00:00.000Z'
  });
}

async function openApp(page){
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
}

async function expectNoHorizontalOverflow(page){
  const result=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  expect(result.scrollWidth,`horizontal overflow: ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.clientWidth+2);
}

async function expectPrimaryTouchTargets(page){
  const selectors=['#homeWalk','#homeReport','#homeOffleash','.bottom-nav .nav-item'];
  for(const selector of selectors){
    const nodes=page.locator(selector);
    const count=await nodes.count();
    for(let i=0;i<count;i++){
      const node=nodes.nth(i);
      if(!await node.isVisible()) continue;
      const box=await node.boundingBox();
      expect(box,`${selector} has no bounding box`).not.toBeNull();
      expect(box.height,`${selector} touch target height`).toBeGreaterThanOrEqual(44);
      expect(box.width,`${selector} touch target width`).toBeGreaterThanOrEqual(44);
    }
  }
}

test('new user can complete onboarding and understand the next step without help',async({page})=>{
  await installSafeRoutes(page);
  await openApp(page);

  const onboarding=page.locator('#onboardingDialog');
  await expect(onboarding).toBeVisible();
  await expect(page.getByRole('heading',{name:/Welkom bij\s*Whatsup dog/i})).toBeVisible();
  await expect(page.locator('#saveProfile')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const name=page.locator('#onboardingName');
  const home=page.locator('#onboardingHome');
  await name.fill('Bowie');
  await expect(name).toHaveValue('Bowie');
  await home.fill('Nijkerk');
  await expect(home).toHaveValue('Nijkerk');
  await page.locator('#avatarGrid .avatar-choice').nth(1).click();
  await page.locator('#saveProfile').click();

  await expect(onboarding).not.toBeVisible();
  await expect(page.locator('#view-home')).toHaveClass(/active/);
  await expect(page.locator('#homeHello')).toContainText('Bowie');
  await expect(page.locator('#homeSubtitle')).toContainText('Nijkerk');
  await expect(page.locator('#homeWalk')).toContainText('Wandelen');
  await expect(page.locator('#homeReport')).toContainText('Melden');
  await expect(page.locator('#homeOffleash')).toContainText('Losloop');

  await page.locator('#homeWalk').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#profileName')).toHaveText('Bowie');
  await expect(page.locator('#profileSubtitle')).toContainText('Nijkerk');
  await expectNoHorizontalOverflow(page);
});

for(const mode of ['dog','cat','both'])test(`${mode.toUpperCase()} mode stays coherent after reload and navigation`,async({page})=>{
  await installSafeRoutes(page);await seedSpeciesProfile(page,mode);await openApp(page);
  await expect(page.locator('body')).toHaveClass(new RegExp(`mode-${mode}`));
  if(mode==='cat'){
    await expect(page.locator('#homeOffleash')).toBeHidden();
    await expect(page.locator('[data-filter="offleash"]')).toBeHidden();
    await expect(page.locator('#homeWalk')).toContainText('Bekijk buurt');
  }else if(mode==='dog'){
    await expect(page.locator('#homeOffleash')).toBeVisible();
    await expect(page.locator('#homeWalk')).toContainText('Wandelen');
  }else{
    await expect(page.locator('#homeTitle')).toContainText('rondom jullie');
    await expect(page.locator('#homeOffleash')).toContainText('Voor hond');
  }
  await page.locator('#homeReport').click();await expect(page.locator('#reportDialog')).toBeVisible();
  const expected=mode==='both'?'both':mode;await expect(page.locator(`input[name="reportSpecies"][value="${expected}"]`)).toBeChecked();
  await page.locator('#reportDialog [data-close-dialog]').click();await page.reload();
  await expect(page.locator('body')).toHaveClass(new RegExp(`mode-${mode}`));await expectNoHorizontalOverflow(page);
});

test('new cat owner selects CAT during onboarding and the choice persists',async({page})=>{
  await installSafeRoutes(page);await openApp(page);
  await page.locator('input[name="speciesContext"][value="cat"]+span').click();
  await expect(page.locator('#breedField')).toBeHidden();
  await expect(page.locator('#avatarGrid')).not.toContainText('🐶');
  await page.locator('#onboardingName').fill('Luna');await page.locator('#onboardingHome').fill('Nijkerk');await page.locator('#saveProfile').click();
  await expect(page.locator('body')).toHaveClass(/mode-cat/);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_profile_v1')).speciesContext)).toBe('cat');
  await page.reload();await expect(page.locator('body')).toHaveClass(/mode-cat/);await expect(page.locator('#homeOffleash')).toBeHidden();
});

test('core report journey with photo can be completed and survives reload',async({page})=>{
  await installSafeRoutes(page);
  await seedProfile(page);
  await openApp(page);

  await page.locator('.bottom-nav [data-view="map"]').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await page.locator('#reportFab').click();
  await expect(page.locator('#reportDialog')).toBeVisible();
  await page.locator('[data-report-type="danger"]').click();
  await expect(page.locator('#reportDetails')).not.toHaveClass(/hidden/);
  await expect(page.locator('#reportDuration')).toBeVisible();
  await expect(page.locator('#reportPhotoInput')).toBeAttached();
  const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="orange"/></svg>');
  await page.locator('#reportPhotoInput').setInputFiles({name:'pad.svg',mimeType:'image/svg+xml',buffer:svg});
  await expect(page.locator('#reportPhotoPreview')).toHaveClass(/show/);
  await page.locator('#reportDuration').selectOption({label:'Net gezien'});
  const impact4=page.locator('.annoyance-scale label').filter({hasText:/^4$/});
  await impact4.click();
  await expect(page.locator('input[name="reportAnnoyance"][value="4"]')).toBeChecked();
  await page.locator('#reportText').fill('Glas op het wandelpad bij het park');
  await page.locator('#publishReport').click();

  await expect(page.locator('#reportDialog')).not.toBeVisible();
  await expect(page.locator('#toast')).toContainText(/melding.*kaart|dankjewel/i);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]'));
  expect(stored).toHaveLength(1);
  expect(stored[0].text).toContain('Glas op het wandelpad');
  expect(stored[0].duration).toBe('Net gezien');
  expect(stored[0].annoyance).toBe(4);
  expect(stored[0].photoDataUrl).toMatch(/^data:image\/jpeg;base64,/);

  await page.reload();
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#myReportCount')).toHaveText('1');
  await page.locator('.bottom-nav [data-view="map"]').click();
  await expect(page.locator('.marker-badge')).toHaveCount(1);
  await page.locator('.marker-badge').first().click();
  await expect(page.locator('.report-detail-photo')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('main navigation stays understandable and primary mobile actions remain tappable',async({page})=>{
  await installSafeRoutes(page);
  await seedProfile(page);
  await openApp(page);

  await expect(page.locator('#homeWalk')).toBeVisible();
  await expect(page.locator('#homeReport')).toBeVisible();
  await expect(page.locator('#homeOffleash')).toBeVisible();
  await expectPrimaryTouchTargets(page);

  for(const view of ['map','chat','alerts','profile','home']){
    await page.locator(`.bottom-nav [data-view="${view}"]`).click();
    await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
    await expectNoHorizontalOverflow(page);
  }
});

test('unavailable findability explains itself instead of acting like a dead switch',async({page})=>{
  await installSafeRoutes(page);
  await seedProfile(page);
  await openApp(page);

  await page.locator('.bottom-nav [data-view="profile"]').click();
  const toggle=page.locator('#directoryOptIn');
  const status=page.locator('#directoryOptInStatus');
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeDisabled();
  await expect(status).toContainText('Tijdelijk niet beschikbaar');
  await expect(status).toHaveAttribute('role','status');
  await expectNoHorizontalOverflow(page);
});

test('findability saves successfully and remains retryable after a failed save',async({page})=>{
  await installDirectoryBackend(page);
  await seedProfile(page);
  await openApp(page);
  await page.locator('.bottom-nav [data-view="profile"]').click();

  const toggle=page.locator('#directoryOptIn');
  const status=page.locator('#directoryOptInStatus');
  await expect(toggle).toBeEnabled();
  await toggle.check();
  await expect(status).toContainText('Je profiel is vindbaar');

  await page.evaluate(()=>{window.__failDirectoryUpdate=true});
  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect(toggle).toBeEnabled();
  await expect(status).toContainText('probeer opnieuw');
});

test('invalid onboarding location gives a recoverable error instead of a dead end',async({page})=>{
  await installSafeRoutes(page,{geocode:'empty'});
  await openApp(page);

  await expect(page.locator('#onboardingDialog')).toBeVisible();
  const name=page.locator('#onboardingName');
  const home=page.locator('#onboardingHome');
  await name.fill('Bowie');
  await expect(name).toHaveValue('Bowie');
  await home.fill('Bestaatnietstad');
  await expect(home).toHaveValue('Bestaatnietstad');
  await page.locator('#saveProfile').click();

  await expect(page.locator('#toast')).toContainText('kon ik niet vinden');
  await expect(page.locator('#onboardingDialog')).toBeVisible();
  await expect(page.locator('#saveProfile')).toBeEnabled();
  await expect(name).toHaveValue('Bowie');
  await expect(home).toHaveValue('Bestaatnietstad');
});

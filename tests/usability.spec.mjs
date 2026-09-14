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
`;

async function installSafeRoutes(page,{geocode='success'}={}){
  await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:backendStub}));
  await page.route('https://nominatim.openstreetmap.org/**',route=>{
    if(geocode==='empty') return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{lat:'52.2182',lon:'5.4835',address:{city:'Nijkerk'}}])});
  });
}

async function seedProfile(page){
  await page.addInitScript(profile=>localStorage.setItem('wd_profile_v1',JSON.stringify(profile)),{
    name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',homeLat:52.2182,homeLng:5.4835,createdAt:'2026-09-14T00:00:00.000Z'
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

test('core report journey can be completed and survives reload',async({page})=>{
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
  await page.locator('#reportDuration').selectOption({label:'Net gezien'});
  await page.locator('input[name="reportAnnoyance"][value="4"]').check({force:true});
  await page.locator('#reportText').fill('Glas op het wandelpad bij het park');
  await page.locator('#publishReport').click();

  await expect(page.locator('#reportDialog')).not.toBeVisible();
  await expect(page.locator('#toast')).toContainText(/melding.*kaart|dankjewel/i);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]'));
  expect(stored).toHaveLength(1);
  expect(stored[0].text).toContain('Glas op het wandelpad');
  expect(stored[0].duration).toBe('Net gezien');
  expect(stored[0].annoyance).toBe(4);

  await page.reload();
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#myReportCount')).toHaveText('1');
  await page.locator('.bottom-nav [data-view="map"]').click();
  await expect(page.locator('.marker-badge')).toHaveCount(1);
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

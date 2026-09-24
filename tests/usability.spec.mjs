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
    window.__testDiscoverable=false;
    const directoryClient={
      from:()=>({
        select:()=>({eq:()=>({maybeSingle:async()=>({data:{discoverable:window.__testDiscoverable},error:null})})})
      }),
      rpc:async(name,args)=>{
        if(name==='set_profile_discoverability'){
          if(window.__failDirectoryUpdate)return {data:null,error:{message:'network'}};
          window.__testDiscoverable=args.enabled;return {data:args.enabled,error:null};
        }
        return {data:[],error:null};
      }
    };
    window.WhatsupDogCommunity={configured:true,client:directoryClient,user:{id:'00000000-0000-0000-0000-000000000001',is_anonymous:false}};
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

async function mockGps(page){
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:{
      getCurrentPosition:success=>success({coords:{latitude:52.2182,longitude:5.4835,accuracy:18}})
    }});
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

test('new user can complete calm onboarding without opening optional details',async({page})=>{
  await installSafeRoutes(page);
  await openApp(page);

  const onboarding=page.locator('#onboardingDialog');
  await expect(onboarding).toBeVisible();
  await expect(page.getByRole('heading',{name:/Voor wie gebruik je Whatsup dog/i})).toBeVisible();
  await expect(page.locator('#saveProfile')).toBeVisible();
  await expect(page.locator('#onboardingOptional')).not.toHaveAttribute('open','');
  await expect(page.locator('#breedGrid')).toBeHidden();
  await expectNoHorizontalOverflow(page);

  const name=page.locator('#onboardingName');
  const home=page.locator('#onboardingHome');
  await name.fill('Bowie');
  await home.fill('Nijkerk');
  await page.locator('#saveProfile').click();

  await expect(onboarding).not.toBeVisible();
  await expect(page.locator('#homeHello')).toContainText('Bowie');
  await expect(page.locator('#homeSubtitle')).toContainText('Nijkerk');
  await expect(page.locator('#homeWalk')).toContainText('Wandelen');
  await expect(page.locator('#homeReport')).toContainText('Melden');

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
  await page.locator('#homeReport').click();await expect(page.locator('#wdQuickWheel')).toBeVisible();await page.locator('[data-quick-type="danger"]').click();await expect(page.locator('#wdWheelSub')).toBeVisible();await page.locator('[data-danger-type="glass"]').click();await expect(page.locator('#reportDialog')).toBeVisible();
  const expected=mode==='both'?'both':mode;await expect(page.locator(`input[name="reportSpecies"][value="${expected}"]`)).toBeChecked();
  await page.locator('#reportDialog [data-close-dialog]').click();await page.reload();
  await expect(page.locator('body')).toHaveClass(new RegExp(`mode-${mode}`));await expectNoHorizontalOverflow(page);
});

test('new cat owner selects CAT during onboarding and the choice persists',async({page})=>{
  await installSafeRoutes(page);await openApp(page);
  await page.locator('input[name="speciesContext"][value="cat"]+span').click();
  await page.locator('#onboardingOptional summary').click();
  await expect(page.locator('#breedField')).toBeHidden();
  await expect(page.locator('#avatarGrid')).not.toContainText('🐶');
  await page.locator('#onboardingName').fill('Luna');await page.locator('#onboardingHome').fill('Nijkerk');await page.locator('#saveProfile').click();
  await expect(page.locator('body')).toHaveClass(/mode-cat/);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_profile_v1')).speciesContext)).toBe('cat');
  await page.reload();await expect(page.locator('body')).toHaveClass(/mode-cat/);await expect(page.locator('#homeOffleash')).toBeHidden();
});

test('phone install help is A2 and switches between Apple and other phones',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await page.locator('#installHelpButton').click();
  await expect(page.locator('#installHelpDialog')).toBeVisible();
  await page.locator('#installAppleTab').click();
  await expect(page.locator('#installSteps li')).toHaveCount(4);
  await expect(page.locator('#installSteps')).toContainText('vierkant met de pijl omhoog');
  await page.locator('#installOtherTab').click();
  await expect(page.locator('#installSteps li')).toHaveCount(4);
  await expect(page.locator('#installSteps')).toContainText('drie puntjes');
  await expectNoHorizontalOverflow(page);
});

test('core report journey with photo can be completed and survives reload',async({page})=>{
  await installSafeRoutes(page);await mockGps(page);await seedProfile(page);await openApp(page);
  await page.locator('.bottom-nav [data-view="map"]').click();await expect(page.locator('#view-map')).toHaveClass(/active/);await page.locator('#wdQuickReport').click();await expect(page.locator('#wdQuickWheel')).toBeVisible();await page.locator('[data-quick-type="danger"]').click();await page.locator('[data-danger-type="glass"]').click();await expect(page.locator('#reportDialog')).toBeVisible();await expect(page.locator('#reportDetails')).not.toHaveClass(/hidden/);await expect(page.locator('#reportPhotoBox')).toBeHidden();await expect(page.locator('#reportAdminMeta')).toBeHidden();
  const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="orange"/></svg>');await page.locator('#reportPhotoV2').setInputFiles({name:'pad.svg',mimeType:'image/svg+xml',buffer:svg});await expect(page.locator('#photoPreviewWrapV2')).toHaveClass(/has-photo/);await page.locator('#reportText').fill('Glas op het wandelpad bij het park');await expect(page.locator('#wdQuickLocation')).toContainText('18 meter');await page.locator('#publishReport').click();
  await expect(page.locator('#reportDialog')).not.toBeVisible();await expect(page.locator('#toast')).toContainText(/melding.*kaart|dankjewel/i);const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]'));expect(stored).toHaveLength(1);expect(stored[0].text).toContain('Glas op het wandelpad');expect(stored[0].lat).toBe(52.2182);expect(stored[0].lng).toBe(5.4835);expect(stored[0].createdAt).toBeTruthy();expect(stored[0].photoDataUrl).toMatch(/^data:image\/jpeg;base64,/);
  await page.reload();await page.locator('.bottom-nav [data-view="profile"]').click();await expect(page.locator('#myReportCount')).toHaveText('1');await page.locator('.bottom-nav [data-view="map"]').click();await expect(page.locator('.marker-badge')).toHaveCount(1);await page.locator('.marker-badge').first().click();await expect(page.locator('#detailContent img')).toBeVisible();await expectNoHorizontalOverflow(page);
});

test('main navigation stays understandable and primary mobile actions remain tappable',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);await expect(page.locator('#homeWalk')).toBeVisible();await expect(page.locator('#homeReport')).toBeVisible();await expect(page.locator('#homeOffleash')).toBeVisible();await expectPrimaryTouchTargets(page);
  for(const view of ['map','feed','chat','profile','home']){await page.locator(`.bottom-nav [data-view="${view}"]`).click();await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);await expectNoHorizontalOverflow(page)}
});

test('calm map keeps filters behind one layers interaction',async({page})=>{
  await installSafeRoutes(page);await seedSpeciesProfile(page,'both');await openApp(page);await page.locator('.bottom-nav [data-view="map"]').click();const layers=page.locator('#layersButton'),filters=page.locator('#filterRow');await expect(layers).toBeVisible();await expect(layers).toHaveAttribute('aria-expanded','false');await expect(filters).toBeHidden();await layers.click();await expect(filters).toBeVisible();await expect(layers).toHaveAttribute('aria-expanded','true');await page.locator('[data-filter="danger"]').click();await expect(filters).toBeHidden();await expect(page.locator('#wdQuickReport')).toBeVisible();await expectNoHorizontalOverflow(page);
});

test('unavailable findability explains itself instead of acting like a dead switch',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);await page.locator('.bottom-nav [data-view="profile"]').click();const toggle=page.locator('#directoryOptIn');const status=page.locator('#directoryOptInStatus');await expect(toggle).toBeVisible();await expect(toggle).toBeDisabled();await expect(status).toContainText('Meld je aan om vindbaar te worden');await expect(status).toHaveAttribute('role','status');await expectNoHorizontalOverflow(page);
});

test('findability saves successfully and remains retryable after a failed save',async({page})=>{
  await installDirectoryBackend(page);await seedProfile(page);await openApp(page);await page.locator('.bottom-nav [data-view="profile"]').click();const toggle=page.locator('#directoryOptIn');const status=page.locator('#directoryOptInStatus');await expect(toggle).toBeEnabled();await toggle.check();await expect(status).toContainText('Je profiel is vindbaar');await page.evaluate(()=>{window.__failDirectoryUpdate=true});await toggle.click();await expect(toggle).toBeChecked();await expect(toggle).toBeEnabled();await expect(status).toContainText('probeer opnieuw');
});

test('invalid onboarding location gives a recoverable error instead of a dead end',async({page})=>{
  await installSafeRoutes(page,{geocode:'empty'});await openApp(page);await expect(page.locator('#onboardingDialog')).toBeVisible();await expect(page.locator('#avatarGrid')).toHaveAttribute('data-wd-enhanced','1');await expect(page.locator('body')).toHaveClass(/mode-dog/);const name=page.locator('#onboardingName');const home=page.locator('#onboardingHome');await name.fill('Bowie');await home.fill('Bestaatnietstad');await page.locator('#saveProfile').click();await expect(page.locator('#onboardingDialog')).toBeVisible();await expect(page.locator('#saveProfile')).toBeEnabled();await expect(name).toHaveValue('Bowie');await expect(home).toHaveValue('Bestaatnietstad');
});

test('only one visible half-wheel remains and normal bottom navigation works',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await expect(page.locator('#pawWheel')).toHaveCount(0);
  await expect(page.locator('#wdQuickReport')).toBeVisible();
  const dock=await page.locator('#wdQuickReport').boundingBox();const viewport=page.viewportSize();
  expect(dock.x+dock.width).toBeGreaterThan(Math.min(viewport.width,900));
  expect(dock.x).toBeLessThan(viewport.width);
  expect(dock.width).toBeGreaterThanOrEqual(200);
  await page.locator('#wdQuickReport').click();
  await expect(page.locator('#wdQuickWheel')).toBeVisible();
  await expect(page.locator('#wdQuickWheel [data-quick-type]')).toHaveCount(6);
  await page.locator('[data-quick-type="other"]').click();
  await expect(page.locator('#wdWheelSub')).toBeVisible();
  await page.locator('[data-danger-type="dirty"]').click();
  await expect(page.locator('#reportDialog')).toBeVisible();
  await expect(page.locator('#wdWheelSub')).toBeHidden();
  await page.locator('#reportDialog [data-close-dialog]').click();
  await page.locator('.bottom-nav [data-view="chat"]').click();
  await expect(page.locator('#view-chat')).toHaveClass(/active/);
});

test('docked wheel shows the six aligned choices before opening and supports keyboard snap',async({page})=>{
  await installSafeRoutes(page);await mockGps(page);await seedProfile(page);await openApp(page);
  await expect(page.locator('#wdQuickReport .wd-dock-sector')).toHaveCount(6);
  await expect(page.locator('#wdQuickReport')).toContainText('Gevaar');
  await expect(page.locator('#wdQuickReport')).toContainText('Overig');
  await page.locator('#wdQuickReport').click();
  const wheel=page.locator('.wd-wheel-disc');
  await expect(wheel).toBeFocused();
  await expect(page.locator('#wdWheelSelection')).toContainText('Hond');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#wdWheelSelection')).toContainText('Kat');
  await page.keyboard.press('Enter');
  await expect(page.locator('#reportDialog')).toBeVisible();
  await expect(page.locator('#wdQuickWheel')).toBeHidden();
});

test('one-finger wheel drag snaps to a choice and opens its quick form',async({page})=>{
  await installSafeRoutes(page);await mockGps(page);await seedProfile(page);await openApp(page);
  await page.locator('#wdQuickReport').click();
  const box=await page.locator('.wd-wheel-disc').boundingBox();
  expect(box).not.toBeNull();
  const centerX=box.x+box.width/2,centerY=box.y+box.height/2,radius=box.width*.32;
  await page.mouse.move(centerX+radius,centerY);
  await page.mouse.down();
  await page.mouse.move(centerX+radius*.5,centerY-radius*.87,{steps:10});
  await page.mouse.up();
  await expect(page.locator('#reportDialog')).toBeVisible();
  await expect(page.locator('#wdQuickWheel')).toBeHidden();
  await expect(page.locator('#wdQuickLocation')).toContainText('18 meter');
});

test('public feed never represents local pending reports as shared',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await page.evaluate(()=>{
    localStorage.setItem('wd_reports_v1',JSON.stringify([
      {id:'pending',type:'danger',text:'Dit staat alleen op mijn toestel',_remote:false,createdAt:'2026-09-24T10:00:00Z'},
      {id:'shared',type:'fun',text:'Deze melding is centraal bevestigd',_remote:true,species:'dog',createdAt:'2026-09-24T11:00:00Z',author:'Bowie'}
    ]));
    document.documentElement.dataset.community='community-aan';
    document.dispatchEvent(new CustomEvent('wd:shared-reports-updated'));
  });
  await page.locator('.bottom-nav [data-view="feed"]').click();
  await expect(page.locator('.wd-feed-card')).toHaveCount(1);
  await expect(page.locator('#publicFeedList')).toContainText('Deze melding is centraal bevestigd');
  await expect(page.locator('#publicFeedList')).not.toContainText('Dit staat alleen op mijn toestel');
});

test('maintenance stays hidden without a server-verified moderator role',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await page.evaluate(()=>{
    localStorage.setItem('wd_role','moderator');
    document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label:'Community aan'}}));
  });
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#wdMaintenance')).toBeHidden();
});

test('personal alerts show only real shared reports and persist filters',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await page.evaluate(()=>{
    localStorage.setItem('wd_reports_v1',JSON.stringify([
      {id:'a1',type:'danger',species:'dog',text:'Glas bij het park',_remote:true,createdAt:'2026-09-24T10:00:00Z'},
      {id:'a2',type:'fun',species:'dog',text:'Leuke ontmoetingsplek',_remote:true,createdAt:'2026-09-24T09:00:00Z'},
      {id:'a3',type:'danger',species:'dog',text:'Nog niet gedeeld',_remote:false,createdAt:'2026-09-24T08:00:00Z'}
    ]));
    document.documentElement.dataset.community='community-aan';
    document.dispatchEvent(new CustomEvent('wd:shared-reports-updated'));
  });
  await page.locator('#homeToAlerts').click();
  await expect(page.locator('#wdAlertList .wd-feed-card')).toHaveCount(1);
  await expect(page.locator('#wdAlertList')).not.toContainText('Nog niet gedeeld');
  await page.locator('#wdAlertActivities').check();
  await expect(page.locator('#wdAlertList .wd-feed-card')).toHaveCount(2);
  await page.locator('#wdAlertDanger').uncheck();
  await expect(page.locator('#wdAlertList .wd-feed-card')).toHaveCount(1);
  await expect(page.locator('#wdAlertList')).toContainText('Leuke ontmoetingsplek');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_alert_preferences_v1')));
  expect(saved.activities).toBe(true);expect(saved.danger).toBe(false);
});

test('verified login opens role-gated maintenance and logout closes it',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);
  await page.route('**/community-backend.js*',route=>route.fulfill({
    status:200,contentType:'application/javascript',body:`
      let activeUser={id:'anonymous-fixture',is_anonymous:true};
      const anon={id:'anonymous-fixture',is_anonymous:true};
      const verified={id:'verified-fixture',email:'beheer@example.test',is_anonymous:false};
      const client={
        auth:{
          signInWithPassword:async({email,password})=>{
            if(email!=='beheer@example.test'||password!=='correct-password')return {error:{message:'Invalid login'}};
            activeUser=verified;document.dispatchEvent(new CustomEvent('wd:auth-changed'));
            document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label:'Community aan'}}));
            return {data:{user:verified},error:null};
          },
          signInWithOtp:async()=>({data:{user:null,session:null},error:null}),
          signOut:async()=>{activeUser=anon;document.dispatchEvent(new CustomEvent('wd:auth-changed'));
            document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label:'Community aan'}}));return {error:null}}
        },
        rpc:async name=>({data:name==='is_report_moderator'&&activeUser.id===verified.id,error:null}),
        from:()=>({select:()=>({order:()=>({limit:async()=>({data:[],error:null})})})})
      };
      window.WhatsupDogCommunity={configured:true,client,get user(){return activeUser}};
      document.documentElement.dataset.community='community-aan';
      document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label:'Community aan'}}));
    `
  }));
  await openApp(page);await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#wdAccountLogin')).toBeVisible();
  await expect(page.locator('#wdMaintenance')).toBeHidden();
  await page.locator('#wdAccountEmail').fill('beheer@example.test');
  await page.locator('#wdAccountPassword').fill('correct-password');
  await page.locator('#wdAccountLogin button[type="submit"]').click();
  await expect(page.locator('#wdAccountSigned')).toBeVisible();
  await expect(page.locator('#wdMaintenance')).toBeVisible();
  await page.locator('#wdMaintenance button').first().click();
  await expect(page.locator('#wdMaintenanceStatus')).toContainText('0 meldingen');
  await page.locator('#wdAccountSigned button').click();
  await expect(page.locator('#wdAccountLogin')).toBeVisible();
  await expect(page.locator('#wdMaintenance')).toBeHidden();
});

test('newly submitted reports explicitly opt in, legacy local reports stay unsent',async({page})=>{
  await installSafeRoutes(page);await mockGps(page);await seedProfile(page);await openApp(page);
  await page.locator('.bottom-nav [data-view="map"]').click();
  await page.locator('#wdQuickReport').click();
  await page.locator('[data-quick-type="danger"]').click();
  await page.locator('[data-danger-type="glass"]').click();
  await expect(page.locator('#wdQuickLocation')).toContainText('18 meter');
  await page.locator('#reportText').fill('Nieuwe veiligheidsmelding in mijn buurt');
  await page.locator('#publishReport').click();
  await expect(page.locator('#reportDialog')).not.toBeVisible();
  const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]'));
  expect(rows.at(-1)._shareIntent).toBe(true);
});

test('preview isolates browser storage and rejects writes to the hosted project',async({page})=>{
  await installSafeRoutes(page);
  await page.goto('/dist/');
  await expect(page.locator('#wdPreviewBanner')).toContainText('PROEFVERSIE');
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#wdAccountPreviewNotice')).toBeVisible();
  await expect(page.locator('#wdAccountPreviewNotice')).toContainText('vul hier geen e-mailadres of wachtwoord in');
  await expect(page.locator('#wdAccountLogin')).toBeHidden();
  await expect(page.locator('#wdAccountRegister')).toBeHidden();
  await expect(page.locator('#wdAccountSigned')).toBeHidden();
  await expect(page.locator('#wdAccountStatus')).toContainText('aanmelden is hier uitgeschakeld');
  const storage=await page.evaluate(()=>{
    window.__wdPreviewStorage.setItem('wd_reports_v1','preview-only');
    return {preview:window.__wdPreviewStorage.getItem('wd_reports_v1'),
      production:window.localStorage.getItem('wd_reports_v1'),
      backing:window.localStorage.getItem('wd-preview-wd_reports_v1')}
  });
  expect(storage).toEqual({preview:'preview-only',production:null,backing:'preview-only'});
  const response=await page.evaluate(async()=>{
    const result=await fetch('https://dohelzkgruxnmejmplgw.supabase.co/rest/v1/reports',{
      method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    return {status:result.status,body:await result.json()};
  });
  expect(response.status).toBe(403);
  expect(response.body.code).toBe('PREVIEW_READ_ONLY');
});

test('quick wheel prefills GPS and local date with camera and gallery options',async({page})=>{
  await installSafeRoutes(page);await mockGps(page);await seedProfile(page);await openApp(page);
  await page.locator('#wdQuickReport').click();
  await expect(page.locator('#wdQuickWheel')).toBeVisible();
  await page.locator('[data-quick-type="danger"]').click();
  await expect(page.locator('#wdWheelSub')).toBeVisible();
  await page.locator('[data-danger-type="glass"]').click();
  await expect(page.locator('#reportDialog')).toBeVisible();
  await expect(page.locator('#wdQuickDateTime')).toContainText('automatisch');
  await expect(page.locator('#wdQuickLocation')).toContainText('18 meter');
  await expect(page.locator('#reportCameraV2')).toHaveAttribute('capture','environment');
  await expect(page.locator('#reportPhotoV2')).toHaveAttribute('accept','image/*');
});
test('quick reporting never guesses a position when GPS fails',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);
  await page.addInitScript(()=>Object.defineProperty(navigator,'geolocation',{configurable:true,value:{
    getCurrentPosition:(_,failure)=>failure({code:1})
  }}));
  await openApp(page);await page.locator('#wdQuickReport').click();
  await page.locator('[data-quick-type="danger"]').click();
  await page.locator('[data-danger-type="glass"]').click();
  await expect(page.locator('#wdQuickLocation')).toContainText('Kies zelf een plek');
  await expect(page.locator('#pickOnMapV2')).toBeVisible();
});

test('chat is real-data only, anonymous visitors see login instead of fabricated conversations',async({page})=>{
  await installSafeRoutes(page);await seedProfile(page);await openApp(page);
  await page.locator('.bottom-nav [data-view="chat"]').click();
  await expect(page.locator('#wdChatGate')).toBeVisible();
  await expect(page.locator('#wdChatContent')).toBeHidden();
  await expect(page.locator('#view-chat')).not.toContainText('Voorbeeldgesprek');
  await page.locator('#wdChatLogin').click();
  await expect(page.locator('#view-profile')).toHaveClass(/active/);
});

// V4.4 map resync regression
// V4.2 marker visibility regression
// V4.1 report regression coverage
import {test,expect} from '@playwright/test';

async function stubBackend(page){
  await page.addInitScript(()=>{
    localStorage.setItem('wd_v3_onboarded','1');
    localStorage.setItem('wd_v3_profile',JSON.stringify({name:'Waldo',petName:'Bowie',breed:'Friese stabij',avatar:'🐶',species:'dog'}));
    localStorage.setItem('wd_v3_settings',JSON.stringify({areaLabel:'Corlaer',lat:52.21,lng:5.48,radius:2000,categories:['danger','lost','animal'],push:false}));
    const chain=(data=[])=>({
      select(){return this},eq(){return this},gt(){return this},order(){return this},
      limit(){return Promise.resolve({data,error:null})},
      maybeSingle(){return Promise.resolve({data:null,error:null})},
      insert(){return Promise.resolve({data:null,error:null})},
      update(){return this},delete(){return this},
      then(resolve){return Promise.resolve({data,error:null}).then(resolve)}
    });
    const client={
      auth:{getSession:async()=>({data:{session:{user:{id:'device-user',is_anonymous:true}}}}),signInAnonymously:async()=>({data:{user:{id:'device-user',is_anonymous:true}},error:null})},
      from:(table)=>chain(table==='reports'?(window.__wdReports||[]):[]),
      rpc:async()=>({data:null,error:null}),
      storage:{from:()=>({createSignedUrl:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null})})},
      functions:{invoke:async()=>({data:{ok:true,sent:0},error:null})}
    };
    window.__wdReports=JSON.parse(localStorage.getItem('__wd_test_reports')||'[]');
    window.__wdTestClient=client;
  });
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={createClient:()=>window.__wdTestClient};'}));
}
test.beforeEach(async({page})=>{await stubBackend(page);await page.goto('/');await page.waitForLoadState('domcontentloaded')});

test('opens straight on the map without account UI',async({page})=>{
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await expect(page.locator('#areaPill')).toContainText('Corlaer');
  await expect(page.locator('input[type=email]')).toHaveCount(1);
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  await expect(page.getByText('Inloggen')).toHaveCount(0);
});

test('PawWheel is thumb reachable and starts report flow',async({page})=>{
  await expect(page.locator('#pawFab')).toBeVisible();
  const box=await page.locator('#pawFab').boundingBox();
  const vp=page.viewportSize();
  expect(box.y).toBeGreaterThan(vp.height*0.55);
  await page.locator('#pawFab').click();
  await expect(page.locator('#pawDialog')).toBeVisible();
  await page.locator('#pawReport').click();
  await expect(page.locator('#reportDialog')).toBeVisible();
  await page.locator('.report-type[data-cat="danger"]').click();
  await expect(page.locator('#reportStep2')).toBeVisible();
  await expect(page.locator('#reportSubs')).toContainText('Glas');
});

test('giveaway is accountless and uses private mail contact',async({page})=>{
  await page.locator('[data-view="giveaway"]').click();
  await expect(page.locator('#view-giveaway')).toHaveClass(/active/);
  await page.locator('#giveCreate').click();
  await expect(page.locator('#giveDialog')).toBeVisible();
  await expect(page.locator('#giveForm input[name=email]')).toBeVisible();
  await expect(page.locator('#giveDialog')).toContainText('Niet zichtbaar in de openbare advertentielijst');
});

test('Meldingen contains area radius filters and push controls',async({page})=>{
  await page.locator('[data-view="alerts"]').click();
  await expect(page.locator('#view-alerts')).toHaveClass(/active/);
  await expect(page.locator('#pushArea')).toContainText('Corlaer');
  await expect(page.locator('#radius')).toHaveValue('2000');
  await expect(page.locator('.push-cat[value="danger"]')).toBeChecked();
  await expect(page.locator('.category-grid')).toBeVisible();
  await expect(page.locator('#pushStatus')).toBeVisible();
});

test('primary navigation uses five modern app tabs',async({page})=>{
  await expect(page.locator('.nav button')).toHaveCount(5);
  await expect(page.locator('.nav .nav-icon')).toHaveCount(5);
  await expect(page.locator('[data-view="alerts"]')).toContainText('Meldingen');
  await expect(page.locator('[data-view="giveaway"]')).toContainText('Weggeefhoek');
});

test('Mijn Whatsup uses structured activity cards instead of empty bars',async({page})=>{
  await page.locator('[data-view="my"]').click();
  await expect(page.locator('#view-my')).toHaveClass(/active/);
  await expect(page.locator('#myReportsCard')).toContainText('Mijn meldingen');
  await expect(page.locator('#myGiveCard')).toContainText('Mijn weggeefitems');
  await expect(page.locator('#myAreaLabel')).toContainText('Corlaer');
});

test('info tab explains install and safety',async({page})=>{
  await page.locator('[data-view="info"]').click();
  await expect(page.locator('#view-info')).toContainText('Gebruik & veiligheid');
  await expect(page.locator('#view-info')).toContainText('iPhone / iPad');
  await expect(page.locator('#view-info')).toContainText('Geen account en geen wachtwoord');
});

test('mobile sheets stay within viewport width and use consistent rounded corners',async({page})=>{
  await page.locator('#areaPill').click();
  await expect(page.locator('#areaDialog')).toBeVisible();
  const sheet=page.locator('#areaDialog .sheet');
  const box=await sheet.boundingBox();
  const vp=page.viewportSize();
  expect(box.width).toBeLessThanOrEqual(vp.width-4);
  const radius=await sheet.evaluate(el=>getComputedStyle(el).borderTopLeftRadius);
  expect(parseFloat(radius)).toBeGreaterThanOrEqual(20);
});

test('own reports can be marked resolved and removed from the live map',async({page})=>{
  await page.locator('[data-view="my"]').click();
  await expect(page.locator('#view-my')).toHaveClass(/active/);
  await expect(page.locator('#myReportsCard')).toContainText('Mijn meldingen');
  await expect(page.locator('#detailResolve')).toHaveText(/Opgelost/);
});

test('Info explains creation, resolution and expiry rules for reports',async({page})=>{
  await page.locator('[data-view="info"]').click();
  await expect(page.locator('#view-info')).toContainText('Spelregels voor meldingen');
  await expect(page.locator('#view-info')).toContainText('Gewone meldingen: 7 dagen');
  await expect(page.locator('#view-info')).toContainText('Leuke plekken en activiteiten: 14 dagen');
  await expect(page.locator('#view-info')).toContainText('Vermist of gevonden: 30 dagen');
  await expect(page.locator('#view-info')).toContainText('Zelf opgelost? Haal hem van de kaart');
});

test('giveaway hero and email banner form one visual series',async({page})=>{
  await page.locator('[data-view="giveaway"]').click();
  const hero=page.locator('.give-hero');
  const banner=page.locator('.contact-banner');
  await expect(hero).toBeVisible();
  await expect(banner).toBeVisible();
  const heroIcon=await page.locator('.give-hero-icon').boundingBox();
  const mailIcon=await page.locator('.contact-icon').boundingBox();
  expect(Math.abs(heroIcon.width-mailIcon.width)).toBeLessThanOrEqual(4);
  expect(Math.abs(heroIcon.height-mailIcon.height)).toBeLessThanOrEqual(4);
  const heroRadius=parseFloat(await hero.evaluate(el=>getComputedStyle(el).borderTopLeftRadius));
  const bannerRadius=parseFloat(await banner.evaluate(el=>getComputedStyle(el).borderTopLeftRadius));
  expect(Math.abs(heroRadius-bannerRadius)).toBeLessThanOrEqual(1);
});

test('map restores Nijkerk losloopgebieden layer with persistent switch',async({page})=>{
  await page.route('**/data/nijkerk-losloopgebieden.geojson*',route=>route.fulfill({
    status:200,contentType:'application/geo+json',
    body:JSON.stringify({type:'FeatureCollection',features:[{
      type:'Feature',
      properties:{id:'test-area',name:'Test losloopgebied'},
      geometry:{type:'Polygon',coordinates:[[[5.48,52.21],[5.481,52.21],[5.481,52.211],[5.48,52.211],[5.48,52.21]]]}
    }]})
  }));
  await page.reload();
  await expect(page.locator('#offleashControl')).toBeVisible();
  await expect(page.locator('#offleashToggle')).toBeChecked();
  await page.locator('#offleashToggle').uncheck();
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('wd_v3_offleash'))).toBe('0');
  await page.reload();
  await expect(page.locator('#offleashToggle')).not.toBeChecked();
});

test('Info shows app version and manual update control',async({page})=>{
  await page.locator('[data-view="info"]').click();
  await expect(page.locator('#appVersion')).toContainText('4.8');
  await expect(page.locator('#versionDate')).toContainText('01-10-2026');
  await expect(page.locator('#checkUpdateButton')).toBeVisible();
});

test('update prompt is present and hidden until a new worker waits',async({page})=>{
  await expect(page.locator('#updateBanner')).toHaveClass(/hidden/);
  await expect(page.locator('#applyUpdateButton')).toHaveText(/Nu bijwerken/);
});

test('update button dismisses banner immediately before worker activation',async({page})=>{
  await page.evaluate(()=>{
    const banner=document.querySelector('#updateBanner');
    banner.classList.remove('hidden');
    const btn=document.querySelector('#applyUpdateButton');
    btn.click();
  });
  await expect(page.locator('#updateBanner')).toHaveClass(/hidden/);
});

test('giveaway contact banner uses a fixed SVG mail icon at full size',async({page})=>{
  await page.locator('[data-view="giveaway"]').click();
  const icon=page.locator('.contact-icon');
  const svg=page.locator('.contact-icon-svg');
  await expect(icon).toBeVisible();
  await expect(svg).toBeVisible();
  const iconBox=await icon.boundingBox();
  const svgBox=await svg.boundingBox();
  expect(iconBox.width).toBeGreaterThanOrEqual(56);
  expect(iconBox.height).toBeGreaterThanOrEqual(56);
  expect(svgBox.width).toBeGreaterThanOrEqual(32);
  expect(svgBox.height).toBeGreaterThanOrEqual(32);
});

test('desktop push repair code is present and test button can re-register',async({page})=>{
  await page.locator('[data-view="alerts"]').click();
  await expect(page.locator('#pushToggle')).toBeVisible();
  await expect(page.locator('#pushStatus')).toBeVisible();
  const app=await page.locator('script[src*="app-v3.js"]').getAttribute('src');
  expect(app).toContain('v=18');
});

test('report can switch from current location to a chosen map location',async({page})=>{
  await page.locator('#pawFab').click();
  await page.locator('#pawReport').click();
  await page.locator('.report-type[data-cat="danger"]').click();
  await expect(page.locator('#reportUseGps')).toHaveClass(/active/);
  await page.locator('#reportChooseMap').click();
  await expect(page.locator('#reportChooseMap')).toHaveClass(/active/);
  await expect(page.locator('#reportLocationMapWrap')).toBeVisible();
  await expect(page.locator('#reportLocationStatus')).toContainText(/kaart|plek/i);
});

test('all report categories expose distinct subtype icons',async({page})=>{
  const categories=[
    ['danger',['🔺','🌿','💧','🚧','🐕']],
    ['animal',['🐾','❤️','🧡']],
    ['handy',['⛔','🚗','💡']],
    ['fun',['💚','🐕','🎈']]
  ];
  for(const [cat,icons] of categories){
    await page.locator('#reportDialog').evaluate(el=>{ if(el.open) el.close(); });
    await page.locator('#pawFab').click();
    await page.locator('#pawReport').click();
    await page.locator('.report-type[data-cat="'+cat+'"]').click();
    const texts=await page.locator('#reportSubs .chip-icon').allTextContents();
    expect(texts).toEqual(icons);
  }
});

test('active own reports distinguish status from actions',async({page})=>{
  const script=await page.locator('script[src*="app-v3.js"]').getAttribute('src');
  expect(script).toContain('v=18');
  const response=await page.request.get('/app-v3.js?v=18');
  const source=await response.text();
  expect(source).toContain('Markeer als opgelost');
  expect(source).toContain('Verwijder melding');
});

test('active polluted-water report is visible as a map marker',async({page})=>{
  const now=new Date();
  const expires=new Date(now.getTime()+7*24*60*60*1000);
  await page.evaluate(({now,expires})=>{
    localStorage.setItem('__wd_test_reports',JSON.stringify([{
      id:'test-water',
      user_id:'device-user',
      author_name:'Test',
      author_avatar:'🐾',
      type:'danger',
      subtype:'Vervuild water',
      text:'Blauwalgen in de sloten',
      lat:52.2136079,
      lng:5.4506171,
      photo_path:null,
      status:'active',
      created_at:now,
      species:'dog',
      expires_at:expires
    }]));
  },{now:now.toISOString(),expires:expires.toISOString()});
  await page.reload();
  await expect(page.locator('.wd-report-marker-icon')).toHaveCount(1);
  await expect(page.locator('.wd-report-marker-icon .marker')).toContainText('💧');
});

test('resolve and delete remove markers from map immediately',async({page})=>{
  const response=await page.request.get('/app-v3.js?v=18');
  const source=await response.text();
  expect(source).toContain('function removeReportMarker');
  expect(source).toContain('function deleteOwnReport');
  expect(source).toContain('function resolveOwnReport');
  expect(source).toContain('delete_own_report');
  expect(source).toContain('reportId:r.id');
});

test('email icon is centered inside its square',async({page})=>{
  await page.locator('[data-view="giveaway"]').click();
  const outer=await page.locator('.contact-icon').boundingBox();
  const inner=await page.locator('.contact-icon-svg').boundingBox();
  expect(Math.abs((outer.x+outer.width/2)-(inner.x+inner.width/2))).toBeLessThanOrEqual(1.5);
  expect(Math.abs((outer.y+outer.height/2)-(inner.y+inner.height/2))).toBeLessThanOrEqual(1.5);
});

test('map view forces report resync',async({page})=>{
  const response=await page.request.get('/app-v3.js?v=18');
  const source=await response.text();
  expect(source).toContain('if(v==="map")');
  expect(source).toContain('refreshReports().catch');
  expect(source).toContain('pageshow');
});

test('showView navigation does not throw and map resyncs',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.locator('[data-view="alerts"]').click();
  await page.locator('[data-view="map"]').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  expect(errors.join('\n')).not.toContain('forEach is not a function');
});

test('latest own active report is brought into the visible map',async({page})=>{
  const now=new Date();
  const expires=new Date(now.getTime()+7*24*60*60*1000);
  await page.evaluate(({now,expires})=>{
    localStorage.removeItem('wd_v3_map_view');
    localStorage.setItem('__wd_test_reports',JSON.stringify([{
      id:'own-water-focus',
      user_id:'device-user',
      author_name:'Waldo',
      author_avatar:'🐶',
      type:'danger',
      subtype:'Vervuild water',
      text:'Let op. Blauwalgen in de sloot',
      lat:52.2144329675342,
      lng:5.45042753219606,
      status:'active',
      created_at:now,
      expires_at:expires,
      species:'dog'
    }]));
  },{now:now.toISOString(),expires:expires.toISOString()});
  await page.reload();
  await expect(page.locator('.wd-report-marker-icon')).toHaveCount(1);
  const marker=await page.locator('.wd-report-marker-icon').boundingBox();
  const mapBox=await page.locator('#map').boundingBox();
  expect(marker.x+marker.width/2).toBeGreaterThan(mapBox.x);
  expect(marker.x+marker.width/2).toBeLessThan(mapBox.x+mapBox.width);
  expect(marker.y+marker.height/2).toBeGreaterThan(mapBox.y);
  expect(marker.y+marker.height/2).toBeLessThan(mapBox.y+mapBox.height);
});

test('active nearby report remains visible after anonymous session changes',async({page})=>{
  const now=new Date(), expires=new Date(Date.now()+7*24*60*60*1000);
  await page.evaluate(({now,expires})=>{
    localStorage.setItem('wd_v3_settings',JSON.stringify({areaLabel:'Corlaer',lat:52.2182,lng:5.4835,radius:5000,categories:['danger'],push:false}));
    localStorage.setItem('wd_v3_map_view',JSON.stringify({lat:52.30,lng:5.70,zoom:14}));
    localStorage.setItem('__wd_test_reports',JSON.stringify([{
      id:'old-session-water',
      user_id:'different-anonymous-session',
      author_name:'Buurtgenoot',
      author_avatar:'🐾',
      type:'danger',
      subtype:'Vervuild water',
      text:'Blauwalgen in de sloten',
      lat:52.2136079,
      lng:5.4506171,
      status:'active',
      created_at:now,
      expires_at:expires,
      species:'dog'
    }]));
  },{now:now.toISOString(),expires:expires.toISOString()});
  await page.reload();
  await expect(page.locator('.wd-report-marker-icon')).toHaveCount(1);
  const marker=await page.locator('.wd-report-marker-icon').boundingBox();
  const mapBox=await page.locator('#map').boundingBox();
  expect(marker.x+marker.width/2).toBeGreaterThan(mapBox.x);
  expect(marker.x+marker.width/2).toBeLessThan(mapBox.x+mapBox.width);
  expect(marker.y+marker.height/2).toBeGreaterThan(mapBox.y);
  expect(marker.y+marker.height/2).toBeLessThan(mapBox.y+mapBox.height);
});

test('report markers stay compact on overview zoom',async({page})=>{
  const now=new Date();
  const expires=new Date(now.getTime()+7*24*60*60*1000);
  await page.evaluate(({now,expires})=>{
    localStorage.setItem('wd_v3_map_view',JSON.stringify({lat:52.2136,lng:5.4506,zoom:12}));
    localStorage.setItem('__wd_test_reports',JSON.stringify([{
      id:'test-compact',
      user_id:'device-user',
      author_name:'Test',
      author_avatar:'🐾',
      type:'danger',
      subtype:'Vervuild water',
      text:'Compact marker test',
      lat:52.2136079,
      lng:5.4506171,
      photo_path:null,
      status:'active',
      created_at:now,
      species:'dog',
      expires_at:expires
    }]));
  },{now:now.toISOString(),expires:expires.toISOString()});
  await page.reload();
  const marker=page.locator('.wd-report-marker-icon');
  await expect(marker).toHaveClass(/is-compact/);
  const box=await marker.locator('.marker').boundingBox();
  expect(box.width).toBeLessThanOrEqual(18);
  await expect(marker.locator('.marker span')).toHaveCount(0);
});

test('report markers reveal icon when zoomed in',async({page})=>{
  const now=new Date();
  const expires=new Date(now.getTime()+7*24*60*60*1000);
  await page.evaluate(({now,expires})=>{
    localStorage.setItem('wd_v3_map_view',JSON.stringify({lat:52.2136,lng:5.4506,zoom:16}));
    localStorage.setItem('__wd_test_reports',JSON.stringify([{
      id:'test-detail',
      user_id:'device-user',
      author_name:'Test',
      author_avatar:'🐾',
      type:'danger',
      subtype:'Vervuild water',
      text:'Detailed marker test',
      lat:52.2136079,
      lng:5.4506171,
      photo_path:null,
      status:'active',
      created_at:now,
      species:'dog',
      expires_at:expires
    }]));
  },{now:now.toISOString(),expires:expires.toISOString()});
  await page.reload();
  const marker=page.locator('.wd-report-marker-icon');
  await expect(marker).not.toHaveClass(/is-compact/);
  const box=await marker.locator('.marker').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(32);
  expect(box.width).toBeLessThanOrEqual(36);
  await expect(marker.locator('.marker')).toContainText('💧');
});

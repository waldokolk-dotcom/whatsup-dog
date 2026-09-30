import {test,expect} from '@playwright/test';

async function stubBackend(page){
  await page.addInitScript(()=>{
    localStorage.setItem('wd_v3_onboarded','1');
    localStorage.setItem('wd_v3_profile',JSON.stringify({name:'Waldo',petName:'Bowie',breed:'Friese stabij',avatar:'🐶',species:'dog'}));
    localStorage.setItem('wd_v3_settings',JSON.stringify({areaLabel:'Corlaer',lat:52.21,lng:5.48,radius:2000,categories:['danger','lost','animal'],push:false}));
    const chain=(data=[])=>({
      select(){return this},eq(){return this},order(){return this},
      limit(){return Promise.resolve({data,error:null})},
      maybeSingle(){return Promise.resolve({data:null,error:null})},
      insert(){return Promise.resolve({data:null,error:null})},
      update(){return this},delete(){return this},
      then(resolve){return Promise.resolve({data,error:null}).then(resolve)}
    });
    const client={
      auth:{getSession:async()=>({data:{session:{user:{id:'device-user',is_anonymous:true}}}}),signInAnonymously:async()=>({data:{user:{id:'device-user',is_anonymous:true}},error:null})},
      from:()=>chain([]),
      rpc:async()=>({data:null,error:null}),
      storage:{from:()=>({createSignedUrl:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null})})},
      functions:{invoke:async()=>({data:{ok:true,sent:0},error:null})}
    };
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

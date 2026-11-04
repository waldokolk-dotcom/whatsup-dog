import {test,expect} from '@playwright/test';

test('tabs and map filters work after backend initialization',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('wd_v3_onboarded','1');
    const chain=(data=[])=>({
      select(){return this},eq(){return this},gt(){return this},order(){return this},
      limit(){return Promise.resolve({data,error:null})},
      maybeSingle(){return Promise.resolve({data:null,error:null})},
      insert(){return Promise.resolve({data:null,error:null})},
      update(){return this},delete(){return this},
      then(resolve){return Promise.resolve({data,error:null}).then(resolve)}
    });
    window.__wdTestClient={
      auth:{getSession:async()=>({data:{session:{user:{id:'test-user',is_anonymous:true}}}}),signInAnonymously:async()=>({data:{user:{id:'test-user'}},error:null})},
      from:()=>chain(),
      rpc:async()=>({data:[],error:null}),
      storage:{from:()=>({createSignedUrl:async()=>({data:null,error:null})})},
      functions:{invoke:async()=>({data:{ok:true},error:null})}
    };
  });
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={createClient:()=>window.__wdTestClient};'}));
  await page.goto('/');
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await expect(page.locator('#view-home')).not.toHaveClass(/active/);
  await expect(page.locator('#onboarding')).not.toBeVisible();
  await page.locator('[data-view="home"]').click();
  await expect(page.locator('#view-home')).toHaveClass(/active/);
  await page.locator('[data-view="map"]').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await page.locator('[data-mapfilter="danger"]').click();
  await expect(page.locator('[data-mapfilter="danger"]')).toHaveClass(/active/);
  await page.locator('[data-view="giveaway"]').click();
  await expect(page.locator('#view-giveaway')).toHaveClass(/active/);
});

test('compact map controls do not overlap on a narrow phone',async({page})=>{
  await page.setViewportSize({width:375,height:667});
  await page.goto('/');
  const selectors=['#areaPill','#offleashControl','.wd-map-filterbar'];
  const boxes=await Promise.all(selectors.map(selector=>page.locator(selector).boundingBox()));
  for(const box of boxes)expect(box).not.toBeNull();
  const [area,offleash,filters]=boxes;
  expect(area.x+area.width).toBeLessThanOrEqual(offleash.x+1);
  expect(Math.min(area.y+area.height,offleash.y+offleash.height)).toBeLessThanOrEqual(filters.y+1);
  expect(filters.x+filters.width).toBeLessThanOrEqual(375);
});

import {test,expect} from '@playwright/test';

test('older report response cannot replace a newer map and home feed',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('wd_v3_onboarded','1');
    const chain=()=>({
      select(){return this},eq(){return this},gt(){return this},order(){return this},
      limit(){return Promise.resolve({data:[],error:null})},
      then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}
    });
    window.__wdPendingReports=[];
    window.__wdQueueActive=false;
    window.__wdTestClient={
      auth:{getSession:async()=>({data:{session:{user:{id:'tester',is_anonymous:true}}}})},
      from:()=>chain(),
      rpc:async name=>{
        if(name==='get_active_reports'){
          if(window.__wdQueueActive)return new Promise(resolve=>window.__wdPendingReports.push(resolve));
          return {data:[],error:null};
        }
        return {data:null,error:null};
      },
      storage:{from:()=>({createSignedUrl:async()=>({data:null,error:null})})},
      functions:{invoke:async()=>({data:{},error:null})}
    };
  });
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2',route=>
    route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={createClient:()=>window.__wdTestClient};'}));
  await page.goto('/');
  await expect(page.locator('#wdHomeReports')).toContainText('Nog geen actieve meldingen');
  await page.evaluate(()=>{window.__wdQueueActive=true});
  await page.locator('[data-view="map"]').click();
  await page.waitForFunction(()=>window.__wdPendingReports.length===1);
  await page.locator('[data-view="alerts"]').click();
  await page.waitForFunction(()=>window.__wdPendingReports.length===2);
  const now=new Date().toISOString(),expires=new Date(Date.now()+3600000).toISOString();
  const report=(id,subtype)=>({id,user_id:'tester',author_name:'Buurt',type:'danger',subtype,
    text:subtype,lat:52.2182,lng:5.4835,status:'active',created_at:now,expires_at:expires,species:'dog'});
  await page.evaluate(r=>window.__wdPendingReports[1]({data:[r],error:null}),report('new','Nieuwe waarschuwing'));
  await expect(page.locator('#wdHomeReports')).toContainText('Nieuwe waarschuwing');
  await page.evaluate(r=>window.__wdPendingReports[0]({data:[r],error:null}),report('old','Oude waarschuwing'));
  await expect(page.locator('#wdHomeReports')).toContainText('Nieuwe waarschuwing');
  await expect(page.locator('#wdHomeReports')).not.toContainText('Oude waarschuwing');
  await expect(page.locator('.wd-report-marker-icon')).toHaveCount(1);
});

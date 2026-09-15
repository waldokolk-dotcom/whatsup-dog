import {test,expect} from '@playwright/test';

const backendStub=`
window.WHATSUP_DOG_BACKEND={provider:'supabase',enabled:false,url:'',publishableKey:'',photoBucket:'report-photos',maxSharedReports:200,signedPhotoSeconds:3600};
const script=document.createElement('script');
script.src='./report-lifecycle.js?v=1.7.1';
script.async=false;
script.dataset.wdReportLifecycle='1';
document.body.appendChild(script);
`;

test('remote report removal fails safe when hosted lifecycle RPC is unavailable',async({page})=>{
  const report={
    id:'remote-fallback-test',type:'danger',text:'Veilige fallback test',lat:52.2,lng:5.4,
    author:'Bowie',createdAt:'2026-09-15T00:00:00.000Z',_remote:true,userId:'test-user'
  };
  await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:backendStub}));
  await page.addInitScript(({profile,report})=>{
    localStorage.setItem('wd_profile_v1',JSON.stringify(profile));
    localStorage.setItem('wd_reports_v1',JSON.stringify([report]));
  },{profile:{name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',homeLat:52.2,homeLng:5.4},report});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await page.waitForFunction(()=>Boolean(window.deleteReport));

  await page.evaluate(()=>{
    window.confirm=()=>true;
    window.WhatsupDogCommunity={
      user:{id:'test-user'},
      client:{rpc:async()=>({error:{code:'PGRST202',message:'Could not find the function public.set_own_report_status in the schema cache'}})},
      refresh:async()=>{}
    };
  });

  const result=await page.evaluate(async report=>window.deleteReport(report),report);
  expect(result).toBe(false);
  await expect(page.locator('#toast')).toContainText('Van jouw kaart verwijderd');
  await expect(page.locator('#toast')).toContainText('Voor iedereen verwijderen lukt tijdelijk niet');
  const state=await page.evaluate(()=>({
    reports:JSON.parse(localStorage.getItem('wd_reports_v1')||'[]'),
    hidden:JSON.parse(localStorage.getItem('wd_hidden_reports_v1')||'[]')
  }));
  expect(state.reports.some(r=>r.id==='remote-fallback-test')).toBe(false);
  expect(state.hidden).toContain('remote-fallback-test');
});

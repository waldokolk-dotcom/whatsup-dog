import { test, expect } from '@playwright/test';

const LIVE_URL='https://waldokolk-dotcom.github.io/whatsup-dog/';

test('live production exposes the owner lifecycle RPC and enhanced delete handler',async({page})=>{
  await page.goto(LIVE_URL,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#app')).toBeVisible();
  await page.waitForFunction(()=>Boolean(window.WhatsupDogCommunity?.user?.id),null,{timeout:20000});
  const probe=await page.evaluate(async()=>{
    const c=window.WhatsupDogCommunity.client;
    const {data:{user}}=await c.auth.getUser();
    const rpc=await c.rpc('set_own_report_status',{target:'wd-e2e-does-not-exist',next_status:'hidden'});
    return {
      userId:user?.id||null,
      lifecycleLoaded:Boolean(window.WHATSUP_DOG_REPORT_LIFECYCLE),
      deleteHandler:String(window.deleteReport||''),
      rpcData:rpc.data??null,
      rpcError:rpc.error?String(rpc.error.message||rpc.error):null,
      rpcCode:rpc.error?.code||null
    };
  });
  console.log('LIFECYCLE_PROBE',JSON.stringify(probe));
  expect(probe.userId).toBeTruthy();
  expect(probe.lifecycleLoaded).toBe(true);
  expect(probe.deleteHandler).toContain('setOwnRemoteStatus');
  expect(probe.rpcError).toMatch(/Report not found or not owner/i);
});

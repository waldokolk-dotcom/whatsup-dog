import { test, expect } from '@playwright/test';

const LIVE_URL='https://waldokolk-dotcom.github.io/whatsup-dog/';
const marker=`wd-live-e2e-${Date.now()}`;

async function onboard(page,name){
  await page.goto(LIVE_URL,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#app')).toBeVisible();
  const dialog=page.locator('#onboardingDialog');
  await expect(dialog).toBeVisible({timeout:15000});
  await page.locator('#onboardingName').fill(name);
  await page.locator('#onboardingHome').fill('Nijkerk, Gelderland');
  await page.locator('#avatarGrid .avatar-choice').nth(1).click();
  await page.locator('#saveProfile').click();
  await expect(dialog).not.toBeVisible({timeout:20000});
  await page.waitForFunction(()=>Boolean(window.WhatsupDogCommunity?.user?.id),null,{timeout:20000});
  await page.waitForFunction(()=>document.documentElement.dataset.community==='community-aan',null,{timeout:20000}).catch(()=>{});
  return await page.evaluate(()=>({
    userId:window.WhatsupDogCommunity?.user?.id||null,
    status:document.querySelector('#profileStatus')?.textContent||''
  }));
}

async function refresh(page){
  await page.evaluate(async()=>{await window.WhatsupDogCommunity?.refresh?.()});
}

async function findReport(page,text){
  return await page.evaluate(target=>{
    const rows=JSON.parse(localStorage.getItem('wd_reports_v1')||'[]');
    return rows.find(r=>r.text===target)||null;
  },text);
}

test('two ordinary users complete the real hosted report + photo lifecycle',async({browser})=>{
  const contextA=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const contextB=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const a=await contextA.newPage();
  const b=await contextB.newPage();
  const text=`Synthetic production check ${marker}`;
  let reportId=null;
  let photoPath=null;

  try{
    const identityA=await onboard(a,'E2E Hond A');
    const identityB=await onboard(b,'E2E Hond B');
    expect(identityA.userId).toBeTruthy();
    expect(identityB.userId).toBeTruthy();
    expect(identityA.userId).not.toBe(identityB.userId);

    // Profile RLS: an ordinary user must only be able to read its own private profile.
    const visibleProfiles=await b.evaluate(async()=>{
      const c=window.WhatsupDogCommunity.client;
      const {data,error}=await c.from('profiles').select('id,display_name');
      return {data,error:error?String(error.message||error):null,self:window.WhatsupDogCommunity.user.id};
    });
    expect(visibleProfiles.error).toBeNull();
    expect(visibleProfiles.data.map(x=>x.id)).toEqual([visibleProfiles.self]);

    await a.locator('.bottom-nav [data-view="map"]').click();
    await expect(a.locator('#view-map')).toHaveClass(/active/);
    await a.locator('#reportFab').click();
    await expect(a.locator('#reportDialog')).toBeVisible();
    await a.locator('[data-report-type="danger"]').click();
    await expect(a.locator('#reportDetails')).not.toHaveClass(/hidden/);

    // Use the same visible photo flow users get. report-photo.js converts this to JPEG client-side.
    const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="orange"/><circle cx="40" cy="30" r="15" fill="white"/></svg>');
    await a.locator('#reportPhotoInput').setInputFiles({name:'synthetic-production-check.svg',mimeType:'image/svg+xml',buffer:svg});
    await expect(a.locator('#reportPhotoPreview')).toHaveClass(/show/,{timeout:10000});
    await a.locator('#reportDuration').selectOption({label:'Net gezien'});
    await a.locator('.annoyance-scale label').filter({hasText:/^4$/}).click();
    await a.locator('#reportText').fill(text);
    await a.locator('#publishReport').click();
    await expect(a.locator('#reportDialog')).not.toBeVisible();

    // Wait until the normal client sync marks the local report as actually hosted.
    await a.waitForFunction(target=>{
      const rows=JSON.parse(localStorage.getItem('wd_reports_v1')||'[]');
      const r=rows.find(x=>x.text===target);
      return Boolean(r?._remote&&r?.userId&&r?.photoPath);
    },text,{timeout:25000});
    const hosted=await findReport(a,text);
    reportId=hosted.id;
    photoPath=hosted.photoPath;
    expect(hosted.userId).toBe(identityA.userId);
    expect(photoPath).toContain(`${identityA.userId}/${reportId}.jpg`);

    // A second ordinary user must receive the active report and a readable signed photo URL.
    await refresh(b);
    await b.waitForFunction(id=>{
      const rows=JSON.parse(localStorage.getItem('wd_reports_v1')||'[]');
      const r=rows.find(x=>x.id===id);
      return Boolean(r?._remote&&r?.photoDataUrl&&r?.photoPath);
    },reportId,{timeout:15000});
    const received=await b.evaluate(id=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').find(r=>r.id===id),reportId);
    expect(received.text).toBe(text);
    expect(received.userId).toBe(identityA.userId);
    expect(received.photoPath).toBe(photoPath);
    const photoReadable=await b.evaluate(async url=>{const r=await fetch(url);return {ok:r.ok,status:r.status,type:r.headers.get('content-type')}} ,received.photoDataUrl);
    expect(photoReadable.ok).toBe(true);
    expect(photoReadable.status).toBe(200);

    // A non-owner must not be able to change the report.
    const unauthorized=await b.evaluate(async id=>{
      const c=window.WhatsupDogCommunity.client;
      const {error}=await c.from('reports').update({text:'unauthorized production change'}).eq('id',id);
      return error?{blocked:true,message:error.message}:{blocked:false};
    },reportId);
    expect(unauthorized.blocked).toBe(true);

    // Owner hides the report through the normal app lifecycle; public visibility must disappear.
    a.once('dialog',d=>d.accept());
    await a.evaluate(id=>{
      const report=JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').find(r=>r.id===id);
      return window.deleteReport(report);
    },reportId);
    await a.waitForFunction(id=>!JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').some(r=>r.id===id),reportId,{timeout:10000});

    await refresh(b);
    await b.waitForFunction(id=>!JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').some(r=>r.id===id),reportId,{timeout:15000});
    const signAfterHide=await b.evaluate(async path=>{
      const {data,error}=await window.WhatsupDogCommunity.client.storage.from('report-photos').createSignedUrl(path,60);
      return {signed:Boolean(data?.signedUrl),error:error?String(error.message||error):null};
    },photoPath);
    expect(signAfterHide.signed).toBe(false);

    console.log(JSON.stringify({
      status:'LIVE_USER_E2E_PASS',
      reportId,
      photoPath,
      users:2,
      production:true,
      cleanup:'public report hidden; synthetic anonymous users/private profile + hidden fixture retained for traceability'
    }));
  } finally {
    // Best-effort privacy cleanup through normal user capability if an assertion failed after publication.
    if(reportId){
      try{
        a.once('dialog',d=>d.accept());
        await a.evaluate(id=>{
          const rows=JSON.parse(localStorage.getItem('wd_reports_v1')||'[]');
          const report=rows.find(r=>r.id===id);
          return report?window.deleteReport(report):null;
        },reportId);
      }catch{}
    }
    await contextA.close();
    await contextB.close();
  }
});

import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {chromium,devices} from '@playwright/test';

const ref='dohelzkgruxnmejmplgw';
const url='https://'+ref+'.supabase.co';
const key=process.env.WHATSUP_DOG_E2E_SERVICE_ROLE_KEY||'';
assert.ok(key.length>20,'Missing protected test-only service role secret');
const config=readFileSync(new URL('../backend-config.js',import.meta.url),'utf8');
assert.ok(config.includes("url:'"+url+"'"),'Refusing browser test against an unapproved production project');
const idTag='wd-real-browser-'+Date.now()+'-'+randomBytes(4).toString('hex');
const email=idTag+'@example.test';
const password='Wd!'+randomBytes(22).toString('base64url');
let userId=null,browser=null,anonymousId=null,loggedOutAnonId=null;
const cleanupErrors=[];
let assertions=0;
const admin=async(path,method='GET',body)=>{
 const response=await fetch(url+path,{
  method,
  headers:{apikey:key,Authorization:'Bearer '+key,...(body?{'Content-Type':'application/json'}:{})},
  body:body?JSON.stringify(body):undefined
 });
 let data=null;const raw=await response.text();
 try{data=raw?JSON.parse(raw):null}catch{data=raw}
 return {response,data};
};
const requireAdmin=async(path,method='GET',body)=>{
 const out=await admin(path,method,body);
 assert.ok(out.response.ok,method+' '+path+' returned '+out.response.status+' '+JSON.stringify(out.data));
 assertions++;return out.data;
};
try{
 const identity=await requireAdmin('/auth/v1/admin/users','POST',{
  email,password,email_confirm:true,user_metadata:{purpose:'whatsup-dog-browser-acceptance',run_id:idTag}
 });
 userId=identity.id;
 assert.ok(userId,'Synthetic auth user missing id');assertions++;
 await requireAdmin('/rest/v1/profiles','POST',{
  id:userId,display_name:'Browser Test Bowie',avatar:'🐶',home_place:'Nijkerk'
 });
 browser=await chromium.launch({headless:true});
 const {defaultBrowserType,...device}=devices['iPhone 14'];
 const context=await browser.newContext({...device});
 const page=await context.newPage();
 page.on('pageerror',err=>console.warn('Browser JavaScript error:',String(err.message).slice(0,220)));
 await page.addInitScript(()=>{
  localStorage.setItem('wd_profile_v1',JSON.stringify({
   name:'Browser Test Bowie',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog',
   homeLat:52.2182,homeLng:5.4835,createdAt:new Date().toISOString()
  }));
 });
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:25000});
 await page.waitForFunction(()=>Boolean(window.WhatsupDogCommunity?.client&&window.WhatsupDogCommunity?.user),null,{timeout:45000});
 const pre=await page.evaluate(()=>({id:window.WhatsupDogCommunity?.user?.id,anonymous:window.WhatsupDogCommunity?.user?.is_anonymous}));
 assert.equal(pre.anonymous,true,'Initial browser session must be the disposable anonymous guest');
 anonymousId=pre.id;
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await page.locator('#wdAccountEmail').fill(email);
 await page.locator('#wdAccountPassword').fill(password);
 await page.locator('#wdAccountLogin button[type="submit"]').click();
 await page.locator('#wdAccountSigned').waitFor({state:'visible',timeout:25000});
 const loggedIn=await page.evaluate(()=>({
  id:window.WhatsupDogCommunity?.user?.id,
  anonymous:window.WhatsupDogCommunity?.user?.is_anonymous,
  message:document.getElementById('wdLoginSuccess')?.textContent
 }));
 assert.equal(loggedIn.id,userId,'Verified account was not active after real mobile browser login');assertions++;
 assert.equal(loggedIn.anonymous,false,'Account was still anonymous after login');assertions++;
 assert.match(loggedIn.message||'',/Inloggen gelukt/,'Visible login success notification missing');assertions++;
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(expected=>window.WhatsupDogCommunity?.user?.id===expected,userId,{timeout:45000});
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await page.locator('#wdAccountSigned').waitFor({state:'visible',timeout:20000});
 assertions++;
 const toggle=page.locator('#directoryOptIn');
 await toggle.waitFor({state:'visible',timeout:20000});
 await page.waitForFunction(()=>!document.getElementById('directoryOptIn')?.disabled,null,{timeout:25000});
 await toggle.check();
 await page.getByText('Je profiel is vindbaar. Opgeslagen.',{exact:true}).waitFor({timeout:20000});
 const found=await requireAdmin('/rest/v1/profiles?id=eq.'+encodeURIComponent(userId)+'&select=discoverable');
 assert.equal(found[0]?.discoverable,true,'Opt-in was not saved to hosted profile');assertions++;
 await toggle.uncheck();
 await page.getByText('Vindbaarheid is uitgeschakeld. Opgeslagen.',{exact:true}).waitFor({timeout:20000});
 assertions++;
 await page.getByRole('button',{name:'Uitloggen'}).click();
 await page.locator('#wdAccountLogin').waitFor({state:'visible',timeout:25000});
 const after=await page.evaluate(()=>({id:window.WhatsupDogCommunity?.user?.id,anonymous:window.WhatsupDogCommunity?.user?.is_anonymous}));
 if(after.anonymous&&after.id!==anonymousId)loggedOutAnonId=after.id;
 assertions++;
 await context.close();
 console.log(JSON.stringify({status:'HOSTED_BROWSER_LOGIN_PASS',project:ref,device:'iPhone 14 Chromium emulation',checks:assertions,journeys:['real hosted password login via browser','visible success and verified session','session survives reload','discoverability opt in and off','logout'],cleanup:'pending'}));
} finally {
 if(browser)await browser.close().catch(err=>cleanupErrors.push('browser close '+String(err.message)));
 for(const id of [...new Set([loggedOutAnonId,anonymousId,userId].filter(Boolean))]){
  try{
   const result=await admin('/auth/v1/admin/users/'+encodeURIComponent(id),'DELETE');
   if(!result.response.ok&&result.response.status!==404)throw Error('HTTP '+result.response.status);
  }catch(err){cleanupErrors.push('disposable user cleanup '+String(err.message))}
 }
 if(cleanupErrors.length)throw Error('Hosted browser cleanup failed: '+cleanupErrors.join('; '));
 console.log(JSON.stringify({status:'HOSTED_BROWSER_CLEANUP_PASS',created_test_users_only:true}));
}

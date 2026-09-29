import {test,expect} from '@playwright/test';

const seed={name:'Oude lokale naam',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog'};
async function setup(page,backend){
 await page.addInitScript(data=>localStorage.setItem('wd_profile_v1',JSON.stringify(data)),seed);
 await page.route('**/backend-config.js*',r=>r.fulfill({status:200,contentType:'application/javascript',body:"window.WHATSUP_DOG_BACKEND={enabled:false};const bridge=document.createElement('script');bridge.src='./community-ui-bridge.js?v=1';bridge.dataset.wdCommunityUi='1';document.body.appendChild(bridge);"}));
 await page.route('**/community-backend.js*',r=>r.fulfill({status:200,contentType:'application/javascript',body:backend}));
 await page.goto('/');
 await page.locator('.bottom-nav [data-view="profile"]').click();
}

test('findability uses saved account profile and persists after reloading',async({page})=>{
 const backend=[
 "const person={id:'11111111-1111-4111-8111-111111111111',email:'member@example.test',is_anonymous:false};",
 "let enabled=localStorage.getItem('test-findable')==='yes';window.__savedDirectory=[];",
 "const record=()=>({display_name:'Bewaarde profielnaam',avatar:'🐕',home_place:'Nijkerk',breed:'Friese stabij',discoverable:enabled});",
 "const client={auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},",
 "from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:record(),error:null})})})}),",
 "rpc:async(name,args)=>{if(name!=='set_profile_discoverability')return {data:null,error:{message:'unexpected RPC'}};",
 "window.__savedDirectory.push(args);enabled=args.enabled;localStorage.setItem('test-findable',enabled?'yes':'no');return {data:enabled,error:null}}};",
 "window.WhatsupDogCommunity={configured:true,client,user:person};",
 "document.dispatchEvent(new CustomEvent('wd:auth-changed'));"
 ].join('\n');
 await setup(page,backend);
 const checkbox=page.locator('#directoryOptIn'),status=page.locator('#directoryOptInStatus');
 await expect(checkbox).toBeEnabled();
 await checkbox.check();
 await expect(status).toContainText('Je profiel is vindbaar');
 const saved=await page.evaluate(()=>window.__savedDirectory.at(-1));
 expect(saved.profile_name).toBe('Bewaarde profielnaam');
 expect(saved.profile_avatar).toBe('🐕');
 expect(saved.enabled).toBe(true);
 await page.reload();
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await expect(checkbox).toBeChecked();
 await checkbox.uncheck();
 await expect(status).toContainText('Vindbaarheid is uitgeschakeld');
 await page.reload();
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await expect(checkbox).not.toBeChecked();
});

test('a successful visibility write stays checked when only the follow-up read fails',async({page})=>{
 const backend=[
 "const person={id:'11111111-1111-4111-8111-111111111111',email:'member@example.test',is_anonymous:false};",
 "let saved=localStorage.getItem('test-discoverable')==='yes';let failRead=false;",
 "const fixtureProfile=()=>({display_name:'Bewaarde profielnaam',avatar:'🐕',home_place:'Nijkerk',breed:'Friese stabij',discoverable:saved});",
 "const readProfile=async()=>{if(failRead){failRead=false;return {data:null,error:{message:'Temporary profile lookup timeout'}}}return {data:fixtureProfile(),error:null}};",
 "const client={auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},",
 "from:()=>({select:()=>({eq:()=>({maybeSingle:readProfile})})}),",
 "rpc:async(name,args)=>{if(name!=='set_profile_discoverability')return {data:null,error:{message:'unexpected RPC'}};",
 "saved=args.enabled;localStorage.setItem('test-discoverable',saved?'yes':'no');failRead=true;return {data:saved,error:null}}};",
 "window.WhatsupDogCommunity={configured:true,client,user:person};",
 "document.dispatchEvent(new CustomEvent('wd:auth-changed'));"
 ].join('\n');
 const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
 await setup(page,backend);
 const toggle=page.locator('#directoryOptIn'),status=page.locator('#directoryOptInStatus');
 try{await expect(toggle).toBeEnabled({timeout:2500})}
 catch{
   const diagnostic=await page.evaluate(()=>({
     visibilityStatus:document.getElementById('directoryOptInStatus')?.textContent,
     connected:!!window.WhatsupDogCommunity?.client,
     verified:!window.WhatsupDogCommunity?.user?.is_anonymous,
     checkDisabled:document.getElementById('directoryOptIn')?.disabled
   }));
   throw new Error('Discoverability test fixture failed to become ready: '+JSON.stringify({diagnostic,pageErrors}));
 }
 await toggle.check();
 await expect(toggle).toBeChecked();
 await expect(toggle).toBeEnabled();
 await expect(status).toContainText('opgeslagen');
 expect(await page.evaluate(()=>localStorage.getItem('test-discoverable'))).toBe('yes');
 await page.reload();
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await expect(toggle).toBeChecked();
});

test('invalid saved password offers a recovery route rather than suggesting a new account',async({page})=>{
 const backend=[
 "const guest={id:'guest',is_anonymous:true};",
 "const client={auth:{signInWithPassword:async()=>({data:null,error:{message:'Invalid login credentials'}}),getUser:async()=>({data:{user:null},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},",
 "from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})}),rpc:async()=>({data:null,error:null})};",
 "window.WhatsupDogCommunity={configured:true,client,user:guest};",
 "document.dispatchEvent(new CustomEvent('wd:auth-changed'));"
 ].join('\n');
 await setup(page,backend);
 await page.locator('#wdAccountEmail').fill('member@example.test');
 await page.locator('#wdAccountPassword').fill('outdated-device-password');
 await page.locator('#wdAccountLogin button[type="submit"]').click();
 await expect(page.locator('#wdAccountStatus')).toContainText('Mail mij een inloglink');
 await expect(page.locator('#wdAccountEmail')).toHaveValue('member@example.test');
 await expect(page.locator('#wdAccountPassword')).toHaveValue('');
 await expect(page.locator('#wdAccountForgot')).toBeVisible();
 await expect(page.locator('#wdAccountLogin')).toBeVisible();
});

test('login is visibly confirmed and restored sign-in is clear',async({page})=>{
 const backend=[
 "const person={id:'22222222-2222-4222-8222-222222222222',email:'member@example.test',is_anonymous:false};",
 "const guest={id:'guest',is_anonymous:true};let current=localStorage.getItem('test-signed')==='yes'?person:guest;",
 "const client={auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),",
 "signInWithPassword:async({email,password})=>{if(email!==person.email||password!=='correct-password')return {data:null,error:{message:'Invalid login credentials'}};",
 "localStorage.setItem('test-signed','yes');setTimeout(()=>{current=person;document.dispatchEvent(new CustomEvent('wd:auth-changed'))},120);",
 "return {data:{user:person,session:{user:person,access_token:'synthetic-browser-session'}},error:null}},",
 "signOut:async()=>{current=guest;localStorage.removeItem('test-signed');document.dispatchEvent(new CustomEvent('wd:auth-changed'));return {error:null}}},",
 "from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})}),rpc:async()=>({data:null,error:null})};",
 "window.WhatsupDogCommunity={configured:true,client,get user(){return current}};",
 "document.dispatchEvent(new CustomEvent('wd:auth-changed'));"
 ].join('\n');
 await setup(page,backend);
 await page.locator('#wdAccountEmail').fill('member@example.test');
 await page.locator('#wdAccountPassword').fill('correct-password');
 await page.locator('#wdAccountLogin button[type="submit"]').click();
 await expect(page.locator('#toast')).toContainText('Je bent ingelogd');
 await expect(page.locator('#wdAccountSigned')).toBeVisible();
 await expect(page.locator('#wdLoginSuccess')).toContainText('Inloggen gelukt');
 await expect(page.locator('#wdAccountSigned')).toContainText('Ingelogd als member@example.test');
 await page.reload();
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await expect(page.locator('#wdAccountSigned')).toBeVisible();
 await expect(page.locator('#wdLoginSuccess')).toContainText('Je bent ingelogd');
 await page.getByRole('button',{name:'Uitloggen'}).click();
 await expect(page.locator('#wdAccountLogin')).toBeVisible();
 await expect(page.locator('#wdAccountSigned')).toBeHidden();
});

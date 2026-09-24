import {test,expect} from '@playwright/test';

test('verified account creation persists the pet profile while discoverability defaults off',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',homeLat:52.2182,homeLng:5.4835,speciesContext:'dog'})));
 await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.WHATSUP_DOG_BACKEND={enabled:false};'}));
 await page.route('**/community-backend.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:`
   const verified={id:'member-fixture',email:'member@example.test',is_anonymous:false,user_metadata:{}};
   let current={id:'guest-fixture',is_anonymous:true};
   window.__memberFixture={sent:null,profile:null};
   const client={
     auth:{
       signUp:async args=>{
         window.__memberFixture.sent={email:args.email,length:args.password.length};
         current=verified;document.dispatchEvent(new CustomEvent('wd:auth-changed'));
         return {data:{session:{user:verified}},error:null};
       },
       updateUser:async args=>{verified.user_metadata={...verified.user_metadata,...(args.data||{})};return {data:{user:verified},error:null}},
       onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
     },
     from:()=>({
       select:()=>({eq:()=>({maybeSingle:async()=>({data:window.__memberFixture.profile,error:null})})}),
       upsert:async row=>{window.__memberFixture.profile={...row,discoverable:false};return {error:null}}
     }),
     rpc:async()=>({data:[],error:null})
   };
   window.WhatsupDogCommunity={configured:true,client,get user(){return current}};
   document.dispatchEvent(new CustomEvent('wd:community-status'));
 `}));
 await page.goto('/');
 await page.locator('.bottom-nav [data-view="profile"]').click();
 await page.locator('#wdAccountRegister').click();
 await expect(page.locator('#wdAccountCreate')).toBeVisible();
 await page.locator('#wdSignupEmail').fill('member@example.test');
 await page.locator('#wdSignupPassword').fill('example-long-passphrase');
 await page.locator('#wdSignupRepeat').fill('example-long-passphrase');
 await page.locator('#wdSignupSubmit').click();
 await expect(page.locator('#wdAccountProfile')).toBeVisible();
 await page.locator('#wdMemberBreed').fill('Friese stabij');
 await page.locator('#wdMemberSave').click();
 await expect(page.locator('#wdMemberStatus')).toContainText('opgeslagen');
 const result=await page.evaluate(()=>({sent:window.__memberFixture.sent,profile:window.__memberFixture.profile,local:JSON.parse(localStorage.getItem('wd_profile_v1'))}));
 expect(result.sent.email).toBe('member@example.test');
 expect(result.profile).toMatchObject({display_name:'Bowie',home_place:'Nijkerk',breed:'Friese stabij',discoverable:false});
 expect(result.local.speciesContext).toBe('dog');
 await expect(page.locator('#wdSignupPassword')).toHaveValue('');
});

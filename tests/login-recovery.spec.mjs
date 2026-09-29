import {test,expect} from '@playwright/test';

const fixture=`
  const guest={id:'guest-local',is_anonymous:true};
  const member={id:'member-local',email:'member@example.test',is_anonymous:false,user_metadata:{}};
  let current=localStorage.getItem('wd_test_signed_in')==='yes'?member:guest;
  window.__loginFixture={recovery:null,newPasswordSet:false};
  const client={
    auth:{
      signInWithPassword:async({email,password})=>{
        if(email!=='member@example.test'||password!=='a-valid-password-123')
          return {data:{user:null,session:null},error:{message:'Invalid login credentials',code:'invalid_credentials'}};
        localStorage.setItem('wd_test_signed_in','yes');
        current=member;
        return {data:{user:member,session:{user:member,access_token:'only-a-browser-test'}},error:null};
      },
      getUser:async()=>({data:{user:current.is_anonymous?null:current},error:null}),
      signOut:async()=>{localStorage.removeItem('wd_test_signed_in');current=guest;document.dispatchEvent(new CustomEvent('wd:auth-changed'));return {error:null}},
      resetPasswordForEmail:async(email,options)=>{window.__loginFixture.recovery={email,redirectTo:options.redirectTo};return {error:null}},
      updateUser:async({password})=>{window.__loginFixture.newPasswordSet=password.length>=12;return {error:null}},
      onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
    },
    from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:member.id,display_name:'Bowie',home_place:'Nijkerk',avatar:'🐶',discoverable:false},error:null})})})}),
    rpc:async()=>({data:false,error:null})
  };
  window.WhatsupDogCommunity={
    configured:true,client,
    get user(){return current},
    syncAuthUser:async(user)=>{
      if(user.id!==member.id)throw Error('Wrong verified session');
      current=member;
      document.dispatchEvent(new CustomEvent('wd:auth-changed'));
      return member;
    }
  };
  document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label:'Community aan'}}));
  document.dispatchEvent(new CustomEvent('wd:auth-changed'));
`;

async function setup(page){
  await page.addInitScript(()=>localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog'})));
  await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.WHATSUP_DOG_BACKEND={enabled:false};'}));
  await page.route('**/community-backend.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:fixture}));
  await page.goto('/');
  await page.locator('.bottom-nav [data-view="profile"]').click();
}

test('realistic failed password attempt exposes usable recovery without deleting the existing account',async({page})=>{
  await setup(page);
  await page.locator('#wdAccountEmail').fill('member@example.test');
  await page.locator('#wdAccountPassword').fill('incorrect-saved-password');
  await page.locator('#wdAccountLogin button[type="submit"]').click();
  await expect(page.locator('#wdAccountStatus')).toContainText('Wachtwoord vergeten?');
  await expect(page.locator('#wdAccountForgot')).toBeVisible();
  await expect(page.locator('#wdAccountEmail')).toHaveValue('member@example.test');
  await expect(page.locator('#wdAccountPassword')).toHaveValue('');
  await page.locator('#wdAccountForgot').click();
  await expect(page.locator('#wdAccountStatus')).toContainText('herstelmail');
  const recovery=await page.evaluate(()=>window.__loginFixture.recovery);
  expect(recovery.email).toBe('member@example.test');
  expect(recovery.redirectTo).toMatch(/^http:\/\/127\.0\.0\.1:8765\//);
  await expect(page.locator('#wdAccountSigned')).toBeHidden();
});

test('successful password login visibly switches to the verified account and survives a reload',async({page})=>{
  await setup(page);
  await page.locator('#wdAccountEmail').fill('member@example.test');
  await page.locator('#wdAccountPassword').fill('a-valid-password-123');
  await page.locator('#wdAccountLogin button[type="submit"]').click();
  await expect(page.locator('#wdAccountSigned')).toBeVisible();
  await expect(page.locator('#wdLoginSuccess')).toContainText('Inloggen gelukt');
  await expect(page.locator('#wdAccountLogin')).toBeHidden();
  await page.reload();
  await page.locator('.bottom-nav [data-view="profile"]').click();
  await expect(page.locator('#wdAccountSigned')).toBeVisible();
  await expect(page.locator('#wdLoginSuccess')).toContainText('Je bent ingelogd');
});

test('recovery callback remains available after the mobile browser consumes the email-link URL',async({page})=>{
  await setup(page);
  await page.evaluate(()=>{
    sessionStorage.setItem('wd_password_recovery_pending_v1','1');
    document.dispatchEvent(new CustomEvent('wd:password-recovery'));
  });
  await expect(page.locator('#wdPasswordRecovery')).toBeVisible();
  await page.locator('#wdRecoveryPassword').fill('new-and-unique-password-123');
  await page.locator('#wdRecoveryRepeat').fill('new-and-unique-password-123');
  await page.locator('#wdPasswordRecovery button[type="submit"]').click();
  await expect(page.locator('#wdPasswordRecovery')).toBeHidden();
  expect(await page.evaluate(()=>window.__loginFixture.newPasswordSet)).toBe(true);
  expect(await page.evaluate(()=>sessionStorage.getItem('wd_password_recovery_pending_v1'))).toBe(null);
});
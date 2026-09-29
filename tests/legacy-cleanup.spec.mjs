import {test,expect} from '@playwright/test';

const owner='55555555-5555-4555-8555-555555555555';
async function setup(page,{verified=true}={}){
 await page.addInitScript(({owner})=>{
  localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog'}));
  localStorage.setItem('wd_reports_v1',JSON.stringify([
   {id:'old-local',text:'Oude melding zonder eigenaar',author:'Oude naam',type:'danger',lat:52.2,lng:5.4},
   {id:'other-remote',text:'Oude gedeelde melding',author:'Ander account',type:'fun',_remote:true,userId:'other-id',lat:52.2,lng:5.4},
   {id:'my-report',text:'Mijn huidige melding',author:'Bowie',type:'fun',_accountOwner:owner,lat:52.2,lng:5.4}
  ]));
 },{owner});
 await page.route('**/backend-config.js*',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.WHATSUP_DOG_BACKEND={enabled:false};'}));
 if(verified)await page.route('**/community-backend.js*',r=>r.fulfill({status:200,contentType:'application/javascript',body:`
 window.WhatsupDogCommunity={configured:true,client:null,user:{id:'${owner}',email:'example@example.test',is_anonymous:false}};
 document.dispatchEvent(new CustomEvent('wd:auth-changed'));`}));
 await page.goto('/');
 await page.locator('.bottom-nav [data-view="profile"]').click();
}

test('verified account can selectively remove old device reports without deleting other user records',async({page})=>{
 await setup(page);
 await expect(page.locator('#wdLegacyCleanup')).toBeVisible();
 await expect(page.locator('#wdLegacyRows input')).toHaveCount(2);
 await page.locator('#wdLegacyRows input').first().check();
 await page.locator('#wdLegacyRows input').last().check();
 const dialogs=[];
 page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});
 await page.locator('#wdLegacyRemove').click();
 await expect(page.locator('#wdLegacyCount')).toContainText('Geen oude meldingen');
 const state=await page.evaluate(()=>({
  reports:JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').map(r=>r.id),
  hidden:JSON.parse(localStorage.getItem('wd_hidden_reports_v1')||'[]'),
  status:document.querySelector('#wdLegacyStatus').textContent
 }));
 expect(state.reports).toEqual(['my-report']);
 expect(state.hidden).toEqual(expect.arrayContaining(['old-local','other-remote']));
 expect(state.status).toContain('niet op de server verwijderd');
 expect(dialogs).toHaveLength(1);
 expect(dialogs[0]).toContain('voor anderen blijven ze zichtbaar');
 await page.reload();
 await expect(page.locator('#wdLegacyRows input')).toHaveCount(0);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('wd_reports_v1')||'[]').map(r=>r.id));
 expect(after).toEqual(['my-report']);
});

test('anonymous visitor cannot see account legacy cleanup controls',async({page})=>{
 await setup(page,{verified:false});
 await expect(page.locator('#wdLegacyCleanup')).toBeHidden();
});

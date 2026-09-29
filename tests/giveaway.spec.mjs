import {test,expect} from '@playwright/test';

test('Weggeefhoek has a dedicated seventh navigation tab',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog'})));
 await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.WHATSUP_DOG_BACKEND={enabled:false};'}));
 await page.goto('/');
 await expect(page.locator('.bottom-nav .nav-item')).toHaveCount(7);
 await expect(page.locator('.bottom-nav [data-view="giveaway"]')).toBeVisible();
 await page.locator('.bottom-nav [data-view="giveaway"]').click();
 await expect(page.locator('#view-giveaway')).toHaveClass(/active/);
 await expect(page.locator('#wdGiveStatus')).toContainText('niet verbonden');
 await expect(page.locator('#view-home')).not.toHaveClass(/active/);
});

test('giveaway requires a verified account and does not expose precise address fields',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Bowie',avatar:'🐶',homePlace:'Nijkerk',speciesContext:'dog'})));
 await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.WHATSUP_DOG_BACKEND={enabled:false};'}));
 await page.goto('/');
 await page.locator('.bottom-nav [data-view="giveaway"]').click();
 await page.locator('#wdGiveCreate').click();
 await expect(page.locator('#view-profile')).toHaveClass(/active/);
 await expect(page.locator('#wdGiveForm')).toBeHidden();
 await expect(page.locator('#wdGiveForm input[name="town"]')).toHaveCount(1);
 await expect(page.locator('#wdGiveForm input[name="address"]')).toHaveCount(0);
});

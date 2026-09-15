import { test, expect } from '@playwright/test';

const backendStub = `window.WHATSUP_DOG_BACKEND={provider:'supabase',enabled:false,url:'',publishableKey:'',photoBucket:'report-photos',maxSharedReports:200,signedPhotoSeconds:3600};`;

async function seedProfile(page){
  await page.addInitScript(()=>localStorage.setItem('wd_profile_v1',JSON.stringify({name:'Boris',avatar:'🐶',speciesContext:'dog',homePlace:'Nijkerk',homeLat:52.2182,homeLng:5.4835,createdAt:'2026-09-15T00:00:00.000Z'})));
}

async function openMap(page){
  await page.route('**/backend-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:backendStub}));
  await seedProfile(page);
  await page.goto('/');
  await page.locator('.bottom-nav [data-view="map"]').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
}

for (const width of [320,390]) test(`map filters remain discoverable and usable at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:780});
  await openMap(page);

  const row=page.locator('#filterRow');
  const first=page.locator('[data-filter="all"]');
  const last=page.locator('[data-filter="offleash"]');
  await expect(first).toBeVisible();
  await expect(last).toBeAttached();

  const geometry=await row.evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,overflowX:getComputedStyle(el).overflowX}));
  expect(geometry.scrollWidth).toBeGreaterThanOrEqual(geometry.clientWidth);
  expect(['auto','scroll']).toContain(geometry.overflowX);

  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeVisible();
  await last.click();
  await expect(last).toHaveClass(/active/);

  const viewport=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth+2);
});

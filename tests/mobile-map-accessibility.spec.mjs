import { test, expect } from '@playwright/test';

// Independent accessibility smoke test for the map-first mobile shell.
// This test does not use or mutate a production backend.
test('mobile map controls expose meaningful accessible names', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wd_v3_onboarded', '1'));
  await page.goto('/');
  await page.locator('[data-view="map"]').click();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: 'Mijn locatie' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Losloopgebieden tonen' })).toBeVisible();
  for (const name of ['Alles', 'Gevaar', 'Vermist', 'Dieren', 'Leuk']) {
    await expect(page.locator('.wd-map-filterbar').getByRole('button', { name, exact: true })).toBeVisible();
  }
});

test('filter rail remains keyboard navigable without horizontal document overflow', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wd_v3_onboarded', '1'));
  await page.goto('/');
  await page.locator('[data-view="map"]').click();
  const rail = page.locator('.wd-map-filterbar');
  await expect(rail).toBeVisible();
  const buttons = rail.locator('button');
  await expect(buttons).toHaveCount(5);
  await buttons.nth(0).focus();
  await expect(buttons.nth(0)).toBeFocused();
  for (let i = 1; i < 5; i++) {
    await page.keyboard.press('Tab');
    await expect(buttons.nth(i)).toBeFocused();
  }
  const viewportWidth = page.viewportSize().width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewportWidth + 1);
});

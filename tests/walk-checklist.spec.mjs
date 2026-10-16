import { test, expect } from '@playwright/test';
test('pre-walk checklist is usable and private', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#wd-walk-checklist')).toBeVisible();
  const check = page.locator('#wd-walk-checklist input[type=checkbox]').first();
  await check.check();
  await expect(check).toBeChecked();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wd_walk_checklist_v1')||'[]').length)).toBe(1);
  await page.reload();
  await expect(page.locator('#wd-walk-checklist input[type=checkbox]').first()).toBeChecked();
  await page.getByRole('button', {name:'Nieuwe wandeling'}).click();
  await expect(page.locator('#wd-walk-checklist input[type=checkbox]').first()).not.toBeChecked();
});

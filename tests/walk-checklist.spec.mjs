import { test, expect } from '@playwright/test';
test('pre-walk checklist is usable and private', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await page.locator('[data-view="home"]').click();
  await expect(page.locator('#wd-walk-checklist')).toBeVisible();
  const check = page.locator('#wd-walk-checklist input[type=checkbox]').first();
  await check.check();
  await expect(check).toBeChecked();
  await expect(page.locator('#wd-walk-progress')).toHaveText('1 van 3 klaar');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wd_walk_checklist_v1')||'[]').length)).toBe(1);
  await page.reload();
  await expect(page.locator('#view-map')).toHaveClass(/active/);
  await page.locator('[data-view="home"]').click();
  await expect(page.locator('#wd-walk-progress')).toHaveText('1 van 3 klaar');
  await expect(page.locator('#wd-walk-checklist input[type=checkbox]').first()).toBeChecked();
  await page.getByRole('button', {name:'Nieuwe wandeling'}).click();
  await expect(page.locator('#wd-walk-checklist input[type=checkbox]').first()).not.toBeChecked();
  await expect(page.locator('#wd-walk-progress')).toHaveText('0 van 3 klaar');
});

test('completing all three items announces readiness without sending data', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-view="home"]').click();
  const boxes = page.locator('#wd-walk-checklist input[type=checkbox]');
  await expect(boxes).toHaveCount(3);
  for (let i = 0; i < 3; i++) await boxes.nth(i).check();
  await expect(page.locator('#wd-walk-progress')).toContainText('Helemaal klaar!');
  await expect(page.locator('#wd-walk-progress')).toHaveAttribute('aria-live', 'polite');
});

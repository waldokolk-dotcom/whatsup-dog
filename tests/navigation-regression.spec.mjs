import {test,expect} from '@playwright/test';

test('navigation handler and filter listener exist', async ({page})=>{
  await page.goto('/');
  const source=await (await page.request.get('/app-v3.js')).text();
  expect(source).toContain('$$('+'"[data-view]"'+').forEach');
  expect(source).toContain('$$('+'"[data-mapfilter]"'+').forEach');
  expect(source).toContain('map.on("zoomend"');
});

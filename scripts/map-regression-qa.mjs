// Release gate: cheap static checks complement, never replace, browser and hosted E2E.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app-v3.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const readme=fs.readFileSync('README.md','utf8');
for(const [pattern,label] of [
 [/function syncReportMarkers|async function syncReportMarkers/,'marker synchronization'],
 [/function renderReportMarkers|async function renderReportMarkers/,'marker rendering'],
 [/clusterReportGroups/,'cluster grouping'],
 [/removeReportMarker/,'immediate marker removal'],
 [/delete_own_report/,'authorized report deletion'],
 [/resolve_own_report/,'authorized report resolution'],
 [/refreshReports/,'report refresh'],
 [/visibilitychange/,'resume refresh'],
 [/navigator\.geolocation/,'location flow'],
 [/nijkerk-losloopgebieden\.geojson/,'off-leash overlay']
]) assert.match(app,pattern,label+' is required');
for(const id of ['map','locateBtn','mapCard','offleashToggle','reportLocationMap']) assert.ok(html.includes('id="'+id+'"'),id+' UI is missing');
assert.doesNotMatch(html,/sb_secret_|service_role/i,'Secrets cannot be embedded in HTML');
assert.match(readme,/do not run `supabase db push` against that hosted project/i,'Hosted migration warning is required');
console.log('PASS: map/report static regression gate (not a hosted end-to-end test)');

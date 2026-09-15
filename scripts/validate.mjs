import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const appSource=read('app.js');
const smartSource=read('smart-report-v3.js');
const indexSource=read('index.html');
const breedSource=read('breed-catalog.js');
const lifecycleSource=read('report-lifecycle.js');
const backendConfigSource=read('backend-config.js');
const versionSource=read('version.js');
const lifecycleMigration=read('supabase/migrations/20260913000100_report_lifecycle.sql');
const lifecycleRecoveryMigration=read('supabase/migrations/20260915000100_reassert_report_lifecycle.sql');
const version=versionSource.match(/version:'(\d+\.\d+\.\d+)'/)?.[1];
assert.ok(version,'Central SemVer version missing');

assert.equal((appSource.match(/function deleteReport\(/g)||[]).length,1,'Duplicate deleteReport handler');
assert.match(appSource,/id="resolveReport"[\s\S]*id="deleteReport"/,'Point detail actions missing');
assert.match(appSource,/el\('resolveReport'\)\.onclick=\(\)=>markReportResolved\(r\)/,'Point resolve handler missing');
assert.match(appSource,/el\('deleteReport'\)\.onclick=\(\)=>deleteReport\(r\)/,'Point delete handler missing');
assert.match(smartSource,/id="resolveReport"[\s\S]*id="deleteReport"/,'Area detail actions missing');
assert.match(smartSource,/\$\('resolveReport'\)\.onclick=\(\)=>markReportResolved\(r\)/,'Area resolve handler missing');
assert.match(smartSource,/\$\('deleteReport'\)\.onclick=\(\)=>deleteReport\(r\)/,'Area delete handler missing');
assert.match(smartSource,/selectedReportType==='lost'&&!selectedLostKind/,'Enhanced report flow must require lost/found choice');
assert.match(smartSource,/const subtype=selectedReportType==='lost'/,'Enhanced report flow must preserve lost/found subtype');
assert.match(smartSource,/\$\('mapPlusBtn'\)\?\.addEventListener\('click',resetOnOpen\)/,'Map quick-add must reset enhanced report state');
assert.match(appSource,/hiddenReports:'wd_hidden_reports_v1'/,'Hidden report storage missing');

const backendSource=read('community-backend.js');
assert.match(backendSource,/wd_hidden_reports_v1/,'Remote hidden report filter missing');
assert.match(backendSource,/hiddenIds\.has\(row\.id\)/,'Remote refresh does not honor hidden reports');
assert.match(backendConfigSource,new RegExp(`report-lifecycle\\.js\\?v=${version.replaceAll('.','\\.')}`),'Persistent report lifecycle controller is not release-versioned');
assert.match(lifecycleSource,/set_own_report_status/,'Report lifecycle must persist owner status to Supabase');
assert.match(lifecycleSource,/LEGACY_CUTOFF/,'Legacy pre-release report cleanup missing');
assert.match(lifecycleSource,/wd_shared_report_queue_v1/,'Deleting an unsynced report must clear the sync queue');
assert.match(lifecycleSource,/Voor iedereen verwijderen lukt tijdelijk niet/,'Remote delete fallback must be truthful');
assert.match(lifecycleMigration,/create or replace function public\.set_own_report_status/,'Owner report lifecycle RPC missing');
assert.match(lifecycleMigration,/user_id=\(select auth\.uid\(\)\)/,'Lifecycle RPC must be owner-scoped');
assert.match(lifecycleRecoveryMigration,/create or replace function public\.set_own_report_status/,'Recovery migration must reassert lifecycle RPC');
assert.match(lifecycleRecoveryMigration,/17bfd990-6e69-4861-be8d-1ecf6b7adea4/,'Exact failed live E2E fixture cleanup missing');
assert.doesNotMatch(lifecycleRecoveryMigration,/delete\s+from|truncate\s|drop\s+table/i,'Recovery migration must not use broad destructive cleanup');

assert.equal((indexSource.match(/breed-catalog\.js/g)||[]).length,1,'Exactly one breed catalog must be loaded');
assert.doesNotMatch(indexSource,/breed-catalog-expanded\.js|breed-custom\.js|breed-custom\.css/,'Legacy breed picker assets still referenced');
assert.match(indexSource,/breed-catalog\.js\?v=2/,'Breed catalog cache-busting version missing');
assert.match(indexSource,/breed\.css\?v=2/,'Breed styles cache-busting version missing');
assert.match(indexSource,/smart-report\.css\?v=3/,'Enhanced report styles are not wired into frontend');
assert.match(indexSource,/smart-report-v3\.js\?v=3/,'Enhanced report controller is not wired into frontend');
assert.match(indexSource,/backend-config\.js\?v=4/,'Backend config is not wired into frontend');
assert.match(indexSource,/community-backend\.js\?v=2/,'Community backend is not wired into frontend');

const breedContext={window:{},document:{getElementById:()=>null}};
vm.runInNewContext(breedSource,breedContext);
const breedCatalog=breedContext.window.WHATSUP_DOG_BREEDS;
assert.ok(Array.isArray(breedCatalog),'Breed catalog export missing');
assert.ok(breedCatalog.length>=400,'Breed catalog unexpectedly small');
const breedNames=Array.from(breedCatalog,x=>String(x.name));
const sortedBreedNames=[...breedNames].sort(new Intl.Collator('nl',{sensitivity:'base',numeric:true}).compare);
assert.deepEqual(breedNames,sortedBreedNames,'Breed catalog is not alphabetical');
assert.equal(new Set(breedNames).size,breedNames.length,'Duplicate breed names');
const stabij=Array.from(breedCatalog).find(x=>x.name==='Stabijhoun (Friese Stabij)');
assert.ok(stabij,'Stabijhoun / Friese Stabij missing');
assert.ok(Array.from(stabij.aliases).includes('Stabijhoun'),'Stabijhoun alias missing');
assert.ok(Array.from(stabij.aliases).includes('Friese Stabij'),'Friese Stabij alias missing');
assert.ok(stabij.popular,'Stabijhoun should be marked popular');
assert.ok(Array.from(breedCatalog).find(x=>x.name==='Labrador Retriever')?.popular,'Popular breed marker missing');
assert.ok(Array.from(breedCatalog).find(x=>x.name==='Australian Shepherd')?.popular,'Official popular breed marker missing');

for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',f]);
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.scope,'./');
assert.equal(manifest.start_url,'./');
const geo=JSON.parse(read('data/nijkerk-losloopgebieden.geojson'));
assert.equal(geo.features.length,20);
for(const f of geo.features)assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type));

const events={};const deleted=[];let core=[];
const context={self:{registration:{scope:'https://example.test/whatsup-dog/'},addEventListener:(k,f)=>events[k]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>({addAll:async files=>{core=files}}),keys:async()=>['vakantieapp-v1','whatsup-dog:https://example.test/other/:v1','whatsup-dog:https://example.test/whatsup-dog/:v1'],delete:async k=>deleted.push(k)}};
vm.runInNewContext(read('sw.js'),context);
let pending;
events.install({waitUntil:p=>pending=p});await pending;
for(const file of core){const clean=file.split('?')[0];assert.ok(clean==='./'||fs.existsSync(clean),'Missing precache '+file);}
assert.ok(core.includes(`./report-lifecycle.js?v=${version}`),'Report lifecycle is not precached with the release version');
events.activate({waitUntil:p=>pending=p});await pending;
assert.deepEqual(deleted,['whatsup-dog:https://example.test/whatsup-dog/:v1']);

const config={window:{},document:{querySelector:()=>true,createElement:()=>({dataset:{}}),body:{appendChild:()=>{}}}};
vm.runInNewContext(read('backend-config.js'),config);
assert.ok(!String(config.window.WHATSUP_DOG_BACKEND.publishableKey).startsWith('sb_secret_'));
if(config.window.WHATSUP_DOG_BACKEND.publishableKey.startsWith('eyJ'))assert.equal(JSON.parse(Buffer.from(config.window.WHATSUP_DOG_BACKEND.publishableKey.split('.')[1],'base64url')).role,'anon');
for(const tag of indexSource.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^https?:/.test(tag[1]))assert.ok(fs.existsSync(tag[1].split('?')[0]),'Missing HTML asset '+tag[1]);}
console.log(`PASS: JavaScript, PWA assets, breed catalog (${breedCatalog.length}), enhanced reporting, persistent report lifecycle, production recovery migration, community wiring, cache isolation, public config, 20 Nijkerk polygons`);

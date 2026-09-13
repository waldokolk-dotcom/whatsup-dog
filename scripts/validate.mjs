import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const appSource=read('app.js'),smartSource=read('smart-report-v3.js');
assert.equal((appSource.match(/function deleteReport\(/g)||[]).length,1,'Duplicate deleteReport handler');
assert.match(appSource,/id="resolveReport"[\s\S]*id="deleteReport"/,'Point detail actions missing');
assert.match(appSource,/el\('resolveReport'\)\.onclick=\(\)=>markReportResolved\(r\)/,'Point resolve handler missing');
assert.match(appSource,/el\('deleteReport'\)\.onclick=\(\)=>deleteReport\(r\)/,'Point delete handler missing');
assert.match(smartSource,/id="resolveReport"[\s\S]*id="deleteReport"/,'Area detail actions missing');
assert.match(smartSource,/\$\('resolveReport'\)\.onclick=\(\)=>markReportResolved\(r\)/,'Area resolve handler missing');
assert.match(smartSource,/\$\('deleteReport'\)\.onclick=\(\)=>deleteReport\(r\)/,'Area delete handler missing');
for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',f]);
const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
const geo=JSON.parse(read('data/nijkerk-losloopgebieden.geojson'));assert.equal(geo.features.length,20);
for(const f of geo.features)assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type));
const events={};const deleted=[];let core=[];
const context={self:{registration:{scope:'https://example.test/whatsup-dog/'},addEventListener:(k,f)=>events[k]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>({addAll:async files=>{core=files}}),keys:async()=>['vakantieapp-v1','whatsup-dog:https://example.test/other/:v1','whatsup-dog:https://example.test/whatsup-dog/:v1'],delete:async k=>deleted.push(k)}};
vm.runInNewContext(read('sw.js'),context);
let pending;events.install({waitUntil:p=>pending=p});await pending;
for(const file of core){const clean=file.split('?')[0];assert.ok(clean==='./'||fs.existsSync(clean),'Missing precache '+file);}
events.activate({waitUntil:p=>pending=p});await pending;
assert.deepEqual(deleted,['whatsup-dog:https://example.test/whatsup-dog/:v1']);
const config={window:{},document:{querySelector:()=>true}};vm.runInNewContext(read('backend-config.js'),config);
assert.ok(!String(config.window.WHATSUP_DOG_BACKEND.publishableKey).startsWith('sb_secret_'));
if(config.window.WHATSUP_DOG_BACKEND.publishableKey.startsWith('eyJ'))assert.equal(JSON.parse(Buffer.from(config.window.WHATSUP_DOG_BACKEND.publishableKey.split('.')[1],'base64url')).role,'anon');
for(const tag of read('index.html').matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^https?:/.test(tag[1]))assert.ok(fs.existsSync(tag[1].split('?')[0]),'Missing HTML asset '+tag[1]);}
console.log('PASS: JavaScript, PWA assets, cache isolation, public config, 20 Nijkerk polygons');

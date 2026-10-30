import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const worker=readFileSync('sw.js','utf8');
const install=worker.split('\n').find(line=>line.includes("addEventListener('install'"))||'';
const activation=worker.slice(worker.indexOf("addEventListener('message'"));
assert.ok(install,'Worker install handler is required');
assert.ok(!install.includes('skipWaiting'),'A new worker must not force an update while someone is using the app');
assert.ok(activation.includes("type==='SKIP_WAITING'"),'The user-approved update action must remain available');
const cacheVersion = worker.match(/const CACHE=PREFIX\+'v(\d+)'/)?.[1];
assert.ok(cacheVersion, 'Worker must use a versioned, scoped cache');
assert.ok(Number(cacheVersion) >= 96, 'Walk checklist release must advance cache beyond v95');
assert.ok(worker.includes("'./walk-checklist.js?v=1'"), 'Offline cache must include the walk checklist asset');
console.log('PASS: user-approved updates and new scoped cache');

// Exercise the real service-worker handlers in a sandbox: no network or production data.
const handlers=new Map(),notifications=[],navigations=[];
let openClients=[];
const appScope='https://example.test/whatsup-dog/';
const mockWorker={
  registration:{scope:appScope,showNotification:async(title,options)=>{notifications.push({title,options})}},
  addEventListener:(type,handler)=>handlers.set(type,handler),
  clients:{matchAll:async()=>openClients,openWindow:async url=>{navigations.push(url)}},
  skipWaiting:()=>{}
};
vm.runInNewContext(worker,{self:mockWorker,URL,location:{origin:'https://example.test'}});
async function pushUrl(url){
  let pending;
  handlers.get('push')({data:{json:()=>({url})},waitUntil:p=>{pending=p}});
  await pending;
  return notifications.at(-1).options.data.url;
}
async function clickUrl(url){
  let pending;
  handlers.get('notificationclick')({notification:{data:{url},close(){}},waitUntil:p=>{pending=p}});
  await pending;
  return navigations.at(-1);
}
assert.equal(await pushUrl('?report=abc'),appScope+'?report=abc','Internal report deep links must work');
assert.equal(await pushUrl('https://attacker.test/phish'),appScope,'External push links must be rejected');
assert.equal(await pushUrl('javascript:alert(1)'),appScope,'Non-web schemes must be rejected');
assert.equal(await pushUrl('https://example.test/other-app/'),appScope,'Other same-origin apps must be rejected');
assert.equal(await pushUrl('/whatsup-dog-evil/'),appScope,'Scope prefix lookalikes must be rejected');
assert.equal(await clickUrl('https://attacker.test/phish'),appScope,'Legacy unsafe notifications must be sanitized on click');
assert.equal(await clickUrl(appScope+'?report=abc'),appScope+'?report=abc');
openClients=[{navigate:async url=>{navigations.push(url)},focus:async()=>{}}];
assert.equal(await clickUrl('https://attacker.test/phish'),appScope,'Existing clients must not navigate off-site');
assert.equal(await clickUrl(appScope+'?report=abc'),appScope+'?report=abc');
console.log('PASS: push and click deep links stay inside the WhatsUp Dog PWA scope');

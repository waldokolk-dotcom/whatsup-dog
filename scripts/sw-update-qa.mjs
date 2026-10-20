import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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

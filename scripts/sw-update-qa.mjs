import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const worker=readFileSync('sw.js','utf8');
const install=worker.split('\n').find(line=>line.includes("addEventListener('install'"))||'';
const activation=worker.slice(worker.indexOf("addEventListener('message'"));
assert.ok(install,'Worker install handler is required');
assert.ok(!install.includes('skipWaiting'),'A new worker must not force an update while someone is using the app');
assert.ok(activation.includes("type==='SKIP_WAITING'"),'The user-approved update action must remain available');
assert.ok(worker.includes("const CACHE=PREFIX+'v95'"),'Updated worker must use a fresh scoped cache');
console.log('PASS: user-approved updates and new scoped cache');

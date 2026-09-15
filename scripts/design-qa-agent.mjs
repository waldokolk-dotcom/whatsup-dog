import fs from 'node:fs';import assert from 'node:assert/strict';
const css=fs.readFileSync('design-system.css','utf8'),index=fs.readFileSync('index.html','utf8');
for(const token of ['--surface-canvas','--text-primary','--accent-action','--space-4','--radius-panel','--elevation-panel'])assert.ok(css.includes(token),`Missing semantic token ${token}`);
assert.equal((index.match(/id="reportFab"/g)||[]).length,1,'Map must expose one primary report action');
assert.match(css,/@media\(max-width:380px\)/,'Small phone composition missing');
console.log('PASS Design QA Agent: semantic system, one map report action and small-phone composition');

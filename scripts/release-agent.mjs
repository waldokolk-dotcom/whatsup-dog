import fs from 'node:fs';
import assert from 'node:assert/strict';

const version=fs.readFileSync('version.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const bridge=fs.readFileSync('community-ui-bridge.js','utf8');
const changelog=fs.readFileSync('CHANGELOG.md','utf8');
const match=version.match(/version:'(\d+\.\d+\.\d+)'/);
assert.ok(match,'Central SemVer version missing');
const v=match[1];
assert.match(changelog,new RegExp(`## \\[${v.replaceAll('.','\\.')}\\]`),'Current version missing from CHANGELOG');
assert.match(bridge,/version\.js\?v=/,'Version controller is not loaded');
assert.match(bridge,/mobile-ui\.js\?v=/,'Mobile UI controller is not loaded');
assert.match(sw,/version\.js\?v=/,'Version metadata must be available offline');
assert.match(sw,/mobile-ui\.js\?v=/,'Mobile UI must be available offline');
assert.doesNotMatch(sw,/CACHE=PREFIX\+'v(?:1[0-9]|2[0-7])'/,'PWA cache version was not advanced for v1.5.0');
console.log(`PASS Release Agent: SemVer ${v}, changelog, UI loaders and PWA cache`);

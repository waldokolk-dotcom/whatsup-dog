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
assert.match(bridge,new RegExp(`version\\.js\\?v=${v.replaceAll('.','\\.')}`),'Version controller does not match release');
assert.match(bridge,new RegExp(`mobile-ui\\.js\\?v=${v.replaceAll('.','\\.')}`),'Mobile UI controller does not match release');
assert.match(bridge,new RegExp(`community-tools\\.js\\?v=${v.replaceAll('.','\\.')}`),'Community tools do not match release');
assert.match(sw,new RegExp(`version\\.js\\?v=${v.replaceAll('.','\\.')}`),'Version metadata must be available offline');
assert.match(sw,new RegExp(`mobile-ui\\.js\\?v=${v.replaceAll('.','\\.')}`),'Mobile UI must be available offline');
assert.match(sw,new RegExp(`community-tools\\.js\\?v=${v.replaceAll('.','\\.')}`),'Community tools must be available offline');
assert.doesNotMatch(sw,/CACHE=PREFIX\+'v(?:1[0-9]|2[0-9])'/,'PWA cache version was not advanced for v1.6.0');
console.log(`PASS Release Agent: SemVer ${v}, changelog, v1.6 loaders and PWA cache`);

import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('app-v3.js','utf8');
for(const selector of ['[data-view]','[data-mapfilter]']){
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const broken=new RegExp('(?<!\\$)\\$\\("'+escaped+'"\\)\\.forEach');
  assert.doesNotMatch(app,broken,'querySelector cannot iterate '+selector);
  assert.ok(app.includes('$$("'+selector+'").forEach'),
    'querySelectorAll must bind all '+selector+' buttons');
}
console.log('PASS: navigation and map filters bind all buttons');

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dialog=fs.readFileSync('dialog-ui.js','utf8');
const bridge=fs.readFileSync('community-ui-bridge.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');

execFileSync(process.execPath,['--check','dialog-ui.js']);
assert.match(bridge,/dialog-ui\.js\?v=3/,'Latest dialog UI controller is not loaded');
assert.match(dialog,/border-radius:28px!important/,'Dialog cards must use one consistent corner radius');
assert.match(dialog,/left:50%!important;top:50%!important/,'Dialogs must start centered');
assert.match(dialog,/card\.addEventListener\('pointerdown'/,'Whole dialog header zone must support pointer dragging');
assert.match(dialog,/inTopZone/,'Dialog header drag zone missing');
assert.match(dialog,/touch-action:none/,'Touch dragging must not scroll the page');
assert.match(dialog,/minVisibleX/,'Dialogs must allow freer movement while remaining recoverable');
assert.match(dialog,/root\.querySelectorAll\('button'\)/,'All exact cross buttons must be inspected for branding');
assert.match(dialog,/button\.textContent\.trim\(\)!=='×'/,'Cross-button branding guard missing');
assert.match(dialog,/icon\.svg/,'Close buttons must use the Whatsup dog app symbol');
assert.match(dialog,/onboarding-body[\s\S]*overflow:auto!important/,'Onboarding scrollbar must stay in the light content panel');
assert.match(dialog,/sheet-card[\s\S]*overflow:auto!important/,'Report popup scrollbar must stay inside the light card');
assert.match(sw,/dialog-ui\.js\?v=3/,'Latest dialog UI must be available offline');
console.log('PASS: centered freely draggable dialogs, branded cross buttons, equal corner radii, contained scrollbars and touch support');

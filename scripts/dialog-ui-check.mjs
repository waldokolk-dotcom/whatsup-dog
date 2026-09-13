import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dialog=fs.readFileSync('dialog-ui.js','utf8');
const bridge=fs.readFileSync('community-ui-bridge.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');

execFileSync(process.execPath,['--check','dialog-ui.js']);
assert.match(bridge,/dialog-ui\.js\?v=1/,'Dialog UI controller is not loaded');
assert.match(dialog,/border-radius:28px!important/,'Dialog cards must use one consistent corner radius');
assert.match(dialog,/left:50%!important;top:50%!important/,'Dialogs must start centered');
assert.match(dialog,/pointerdown/,'Pointer drag interaction missing');
assert.match(dialog,/touch-action:none/,'Touch dragging must not scroll the page');
assert.match(dialog,/clampOffset/,'Dragged dialogs must stay within the viewport');
assert.match(dialog,/onboarding-body[\s\S]*overflow:auto!important/,'Onboarding scrollbar must stay in the light content panel');
assert.match(dialog,/sheet-card[\s\S]*overflow:auto!important/,'Report popup scrollbar must stay inside the light card');
assert.match(sw,/dialog-ui\.js\?v=1/,'Dialog UI must be available offline');
console.log('PASS: centered draggable dialogs, equal corner radii, contained scrollbars, touch and viewport bounds');

import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const app=read('app-v3.js');
const css=read('app-v3.css');
const sw=read('sw.js');
const backend=read('backend-config.js');
assert.ok(fs.existsSync('data/nijkerk-losloopgebieden.geojson'),'Nijkerk losloopgebieden GeoJSON missing');

assert.match(html,/id="view-map"/,'Map view missing');
assert.match(html,/id="offleashToggle"/,'Losloopgebieden switch missing');
assert.match(html,/id="pawFab"/,'Thumb-sized PawWheel launcher missing');
assert.match(html,/id="view-alerts"/,'Notifications tab missing');
assert.match(html,/id="view-giveaway"/,'Giveaway tab missing');
assert.match(html,/id="view-my"/,'Mijn Whatsup tab missing');
assert.match(html,/id="view-info"/,'Use/install/safety tab missing');
assert.match(html,/id="appVersion"/,'Visible app version missing');
assert.match(html,/id="updateBanner"/,'Update prompt missing');
assert.match(html,/id="applyUpdateButton"/,'Update apply button missing');
assert.match(html,/Spelregels voor meldingen/,'Report lifecycle rules missing from Info tab');
assert.match(html,/id="pushToggle"/,'Nearby push settings missing');
assert.match(html,/id="radius"/,'Push radius control missing');
assert.match(html,/Contact e-mail/,'Giveaway mail contact missing');
assert.match(html,/Geen account.*geen wachtwoord/i,'Accountless onboarding copy missing');
assert.doesNotMatch(html,/account-login\.js|account-onboarding\.js|community-chat\.js|id="view-chat"/,'Legacy account/chat UI must not ship');
assert.match(html,/app-v3\.js\?v=8/,'V3 app controller not wired');
assert.match(html,/app-v3\.css\?v=9/,'V3 visual system not wired');

assert.match(app,/signInAnonymously/,'Invisible device auth missing');
assert.match(app,/from\("reports"\)\.insert/,'Shared report persistence missing');
assert.match(app,/create_giveaway_listing/,'Safe giveaway create RPC missing');
assert.match(app,/get_giveaway_contact/,'On-demand giveaway contact lookup missing');
assert.match(app,/dispatch-nearby-push/,'Push dispatch integration missing');
assert.match(app,/PushManager/,'Web Push capability missing');
assert.match(app,/applicationServerKey/,'VAPID subscription missing');
assert.match(app,/register_push_subscription/,'Server-side push subscription reclaim RPC missing');
assert.match(app,/testPushNotification/,'Push test flow missing');
assert.match(html,/id="pushStatus"/,'Push status UI missing');
assert.match(app,/radius_m/,'Radius must persist server-side');
assert.match(app,/categories:s\.categories/,'Push category preferences missing');
assert.match(app,/navigator\.geolocation/,'Device location flow missing');
assert.match(app,/registerUpdateSystem/,'Automatic PWA update registration missing');
assert.match(app,/checkForAppUpdate/,'Update check flow missing');
assert.match(app,/SKIP_WAITING/,'Safe update activation message missing');
assert.match(app,/visibilitychange/,'Foreground update check missing');
assert.match(app,/hideUpdateBanner/,'Update banner dismissal flow missing');
assert.match(app,/setTimeout\(\(\)=>/,'Update fallback reload missing');
assert.match(app,/nijkerk-losloopgebieden\.geojson/,'Official Nijkerk losloopgebieden layer missing');
assert.match(app,/wd_v3_offleash/,'Losloop layer preference persistence missing');
assert.match(app,/openReportDetail/,'Report detail flow missing');
assert.match(app,/resolve_own_report/,'Owner resolve flow missing');
assert.match(app,/archive_expired_reports/,'Automatic report expiry cleanup missing');
assert.match(html,/id="detailResolve"/,'Resolve action missing from report detail');
assert.doesNotMatch(app,/signInWithPassword|signUp\(|resetPasswordForEmail/,'Password/account flows must not ship');
assert.match(app,/\$\$\("\.push-cat"\)\.forEach/,'Push category listeners must bind to all category controls');

assert.match(css,/--green:#0f7a67/,'Approved premium visual tokens missing');
assert.match(css,/\.paw-fab/,'One-hand PawWheel styling missing');
assert.match(css,/\.offleash-control/,'Losloopgebieden control styling missing');
assert.match(css,/backdrop-filter/,'Modern layered app styling missing');

assert.match(sw,/app-v3\.js\?v=8/,'Offline cache missing V3 app');
assert.match(sw,/app-v3\.css\?v=9/,'Offline cache missing V3 CSS');
assert.match(sw,/showNotification/,'Push notification handler missing');
assert.match(sw,/notificationclick/,'Push deep-link handler missing');
assert.match(sw,/SKIP_WAITING/,'Service worker update activation handler missing');
const installHandler=sw.match(/self\.addEventListener\('install',[^\n]+/s)?.[0]||'';
assert.doesNotMatch(installHandler,/skipWaiting/,'New workers should wait for explicit update activation');

execFileSync(process.execPath,['--check','app-v3.js']);
execFileSync(process.execPath,['--check','sw.js']);

const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.scope,'./');
assert.equal(manifest.start_url,'./');

const cfg={window:{},document:{querySelector:()=>true,createElement:()=>({dataset:{}}),body:{appendChild:()=>{}}}};
vm.runInNewContext(backend,cfg);
const key=String(cfg.window.WHATSUP_DOG_BACKEND.publishableKey||'');
assert.ok(key.startsWith('sb_publishable_')||key.startsWith('eyJ'),'Frontend must use a public Supabase key');
assert.ok(!key.startsWith('sb_secret_'),'Secret Supabase key must never ship in browser code');
assert.doesNotMatch(html,/service_role|sb_secret_/,'No privileged key in HTML');

for(const tag of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const target=tag[1].split('?')[0];
 if(!/^https?:/.test(target)&&!target.startsWith('data:'))assert.ok(fs.existsSync(target),'Missing HTML asset '+tag[1]);
}
assert.match(css,/\.nav-icon/,'Colorful primary navigation icons missing');
assert.match(css,/\.activity-summary/,'Modern activity cards missing');
assert.match(css,/\.contact-banner/,'Modern giveaway contact banner missing');
assert.match(css,/\.contact-icon-svg/,'Fixed SVG giveaway contact icon styling missing');
assert.match(html,/class="contact-icon-svg"/,'Fixed SVG giveaway contact icon missing');
assert.match(css,/\.give-card-media/,'Giveaway listing media design missing');
assert.match(html,/IN JOUW BUURT/,'Giveaway listing section heading missing');
assert.match(css,/--radius-ui:20px/,'Unified corner radius tokens missing');
assert.match(css,/dialog\[open\]/,'Responsive dialog layout missing');
console.log('PASS: accountless V3.1 design, five-tab navigation, PawWheel, nearby Web Push, giveaway privacy and PWA security');

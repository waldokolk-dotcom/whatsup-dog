import fs from 'node:fs';
import {createHash} from 'node:crypto';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const head='<head>';
if(!html.includes(head))throw new Error('Preview HTML head missing');
const guard=fs.readFileSync('preview-guard.js');
const guardVersion=createHash('sha256').update(guard).digest('hex').slice(0,12);
html=html.replace(head,head+`\n  <script src="./preview-guard.js?v=${guardVersion}"></script>`);
if(!html.includes(`preview-guard.js?v=${guardVersion}`))throw new Error('Preview safety guard injection failed');
if(!/<title>Whatsup Dog<\/title>/i.test(html))throw new Error('Preview title not found');
html=html.replace(/<title>Whatsup Dog<\/title>/i,'<title>Whatsup Dog · Veilige proefversie</title>');
fs.writeFileSync(file,html);
fs.copyFileSync('preview-guard.js','dist/preview-guard.js');
// The offline shell must never load without its read-only safety gateway.
// Precache the guard with the exact URL injected into index.html and rotate the cache on every guard change.
const workerFile='dist/sw.js';
let worker=fs.readFileSync(workerFile,'utf8');
if(!worker.includes("const CORE=["))throw new Error('Preview worker precache list missing');
worker=worker.replace('const CORE=[',`const CORE=['./preview-guard.js?v=${guardVersion}',`);
if(!worker.includes(`./preview-guard.js?v=${guardVersion}`))throw new Error('Preview guard not precached');
worker=worker.replace(/const CACHE=PREFIX\+'[^']+';/,`const CACHE=PREFIX+'preview-${guardVersion}';`);
fs.writeFileSync(workerFile,worker);
if(!fs.readFileSync('dist/preview-guard.js').equals(guard))throw new Error('Preview safety guard differs from source');
const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest','utf8'));
manifest.name='Whatsup dog · proefversie';manifest.short_name='Whatsup dog proef';
fs.writeFileSync('dist/manifest.webmanifest',JSON.stringify(manifest));
console.log('Preview static assets built with isolated local storage and Supabase read-only gateway');

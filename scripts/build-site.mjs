import fs from 'node:fs';

const files=[
  'index.html','app-v3.css','whatsup-premium.css','app-v3.js','backend-config.js','sw.js',
  'manifest.webmanifest','icon-192.png','icon-512.png'
];
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist',{recursive:true});
for(const name of files){
  if(!fs.existsSync(name)) throw new Error('Missing production asset: '+name);
  fs.copyFileSync(name,'dist/'+name);
}
fs.mkdirSync('dist/vendor/leaflet',{recursive:true});
for(const name of ['leaflet.js','leaflet.css']){
  fs.copyFileSync('vendor/leaflet/'+name,'dist/vendor/leaflet/'+name);
}
fs.cpSync('vendor/leaflet/images','dist/vendor/leaflet/images',{recursive:true});
fs.mkdirSync('dist/data',{recursive:true});
fs.copyFileSync('data/nijkerk-losloopgebieden.geojson','dist/data/nijkerk-losloopgebieden.geojson');
fs.writeFileSync('dist/.nojekyll','');
const html=fs.readFileSync('dist/index.html','utf8');
for(const asset of ['whatsup-premium.css','app-v3.css','app-v3.js','sw.js']){
 if(!fs.existsSync('dist/'+asset))throw new Error('Production bundle missing '+asset);
 if(!html.includes(asset))throw new Error('HTML missing required app asset '+asset);
}
if(!fs.readFileSync('dist/whatsup-premium.css','utf8').includes('.wd-home'))throw new Error('Production premium stylesheet incomplete');
console.log('PASS: Whatsup Dog 2.1 premium CSS, app JS and worker present in production bundle');
console.log('Accountless V3 production bundle only: no retired login/chat assets and no server secrets');

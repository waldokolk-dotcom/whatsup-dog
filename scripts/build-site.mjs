import fs from 'node:fs';

const files=[
  'index.html','app-v3.css','app-v3.js','backend-config.js','sw.js',
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
fs.writeFileSync('dist/.nojekyll','');
console.log('Accountless V3 production bundle only: no retired login/chat assets and no server secrets');

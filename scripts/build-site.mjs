import fs from 'node:fs';
fs.mkdirSync('dist',{recursive:true});
for(const name of fs.readdirSync('.'))if(/\.(html|css|js|svg|png|webmanifest)$/.test(name))fs.copyFileSync(name,'dist/'+name);
for(const name of ['data','vendor'])if(fs.existsSync(name))fs.cpSync(name,'dist/'+name,{recursive:true});
fs.writeFileSync('dist/.nojekyll','');
console.log('Static assets only: dist (no server secrets, SQL or tests)');

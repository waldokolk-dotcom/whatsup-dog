const PREFIX='whatsup-dog:'+self.registration.scope+':';
const CACHE=PREFIX+'v84';
const CORE=['./','./index.html','./app-v3.css?v=20','./app-v3.js?v=22','./backend-config.js?v=4','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/leaflet/leaflet.js','./vendor/leaflet/leaflet.css','./data/nijkerk-losloopgebieden.geojson'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));return r}).catch(()=>caches.match('./index.html')));return}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request)))});
self.addEventListener('push',e=>{let p={};try{p=e.data?.json()||{}}catch{}e.waitUntil(self.registration.showNotification(p.title||'Whatsup Dog',{body:String(p.body||'Nieuwe melding in jouw buurt').slice(0,180),icon:'./icon-192.png',badge:'./icon-192.png',tag:p.reportId?'report-'+p.reportId:'whatsup-dog',data:{url:p.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'./';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{for(const c of clients){if('focus'in c){c.navigate(url);return c.focus()}}return self.clients.openWindow(url)}))});
self.addEventListener('message',e=>{
  if(e.data?.type==='SKIP_WAITING')self.skipWaiting();
});

const PREFIX='whatsup-dog:'+self.registration.scope+':';
const CACHE=PREFIX+'v16';
const CORE=['./vendor/leaflet/leaflet.js','./vendor/leaflet/leaflet.css','./vendor/leaflet/images/layers.png','./vendor/leaflet/images/layers-2x.png','./vendor/leaflet/images/marker-icon.png','./icon-192.png','./icon-512.png','./','./index.html','./styles.css?v=5','./home.css?v=5','./app.js?v=6','./official-areas.js?v=9','./home.js?v=5','./smart-report.css?v=3','./smart-report-v3.js?v=3','./backend-config.js?v=4','./community-backend.js?v=2','./community-ui-bridge.js?v=1','./manifest.webmanifest','./icon.svg','./waldo-mark.png','./data/nijkerk-losloopgebieden.geojson'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin){event.respondWith(fetch(event.request));return}
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',clone));}return response}).catch(()=>caches.match('./index.html')));return}
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));}return response}).catch(()=>caches.match(event.request)))
});
self.addEventListener('push',event=>{let payload={};try{payload=event.data?.json()||{}}catch{}event.waitUntil(self.registration.showNotification('Whatsup dog',{body:String(payload.body||'Er is een nieuwe melding.').slice(0,180),icon:'./icon-192.png',tag:'whatsup-dog'}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.openWindow(self.registration.scope))});


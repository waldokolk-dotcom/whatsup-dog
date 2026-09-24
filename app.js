const STORAGE={profile:'wd_profile_v1',reports:'wd_reports_v1',chat:'wd_chat_v1',hiddenReports:'wd_hidden_reports_v1'};
const avatars=['🐶','🐕','🦮','🐩','🐕‍🦺','🐕','🐶','🐾'];
const reportTypes=[
  {id:'danger',icon:'❗',label:'Gevaar',marker:'danger'},
  {id:'vegetation',icon:'🌿❗',label:'Vegetatie',marker:'vegetation'},
  {id:'dirty',icon:'💩',label:'Vervuiling',marker:'danger'},
  {id:'road',icon:'🚧',label:'Pad / weg',marker:'danger'},
  {id:'fun',icon:'💚',label:'Leuke plek',marker:'fun'},
  {id:'walk',icon:'🐾',label:'Samen wandelen',marker:'social'},
  {id:'spotted',icon:'🐾',label:'Dier gezien',marker:'social'},
  {id:'other',icon:'⭐',label:'Overig',marker:'social'},
  {id:'lost',icon:'🚨',label:'Vermist / gevonden',marker:'lost'}
];
const vegetationKinds=['Grasaren','Berenklauw','Eikenprocessierups','Brandnetels','Giftige plant','Stekelige struiken','Anders'];
const breeds=['Labrador Retriever','Golden Retriever','Duitse Herder','Franse Bulldog','Poedel','Border Collie','Berner Sennenhond','Teckel','Beagle','Boxer','Chihuahua','Shih Tzu','Mopshond','Cocker Spaniël','Jack Russell Terriër','Rottweiler','Siberische Husky','Pomeriaan','Maltezer','Bichon Frisé','Cavalier King Charles Spaniël','Staffordshire Bull Terriër','Whippet','Yorkshire Terriër','Kruising / Mix','Anders'];
let selectedAvatar=avatars[0],selectedBreed=breeds[0],selectedReportType=null,selectedVegetation=null,selectedLostKind=null,activeFilter='all';
let map,reportLayer,offleashLayer,onleashLayer,currentArea=null;
const el=id=>document.getElementById(id);
function loadJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveJSON(key,value){localStorage.setItem(key,JSON.stringify(value))}
function toast(message){const t=el('toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
function profile(){return loadJSON(STORAGE.profile,null)}
function escapeHTML(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function setupDialogs(){document.addEventListener('click',e=>{const b=e.target.closest('[data-close-dialog]');if(!b)return;e.preventDefault();e.stopPropagation();const dlg=b.closest('dialog');if(dlg?.open)dlg.close()})}
function setupNavigation(){document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));el('profileQuick')?.addEventListener('click',()=>showView('profile'))}
function showView(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));el(`view-${view}`)?.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));if(view==='map'&&map){requestAnimationFrame(()=>map.invalidateSize({pan:false}));setTimeout(()=>map.invalidateSize({pan:false}),140)}}

function initMap(){
  if(typeof L==='undefined'){el('map').innerHTML='<div style="padding:140px 24px;text-align:center">De kaart kon niet laden. Controleer je internetverbinding.</div>';return}
  const p=profile();
  const start=p?.homeLat!=null&&p?.homeLng!=null&&Number.isFinite(Number(p.homeLat))&&Number.isFinite(Number(p.homeLng))?[Number(p.homeLat),Number(p.homeLng)]:[52.2182,5.4835];
  map=L.map('map',{zoomControl:false,attributionControl:true}).setView(start,14);L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  reportLayer=L.layerGroup().addTo(map);offleashLayer=L.featureGroup().addTo(map);onleashLayer=L.featureGroup();
  drawReports();
  el('locateBtn')?.addEventListener('click',locateUser);
  el('mapZoomBtn')?.addEventListener('click',zoomToDogAreas);
  el('mapPlusBtn')?.addEventListener('click',()=>{resetReportForm();el('reportDialog')?.showModal()});
  setupFilters();
  el('offleashToggle')?.addEventListener('change',e=>{if(e.target.checked){offleashLayer.addTo(map)}else if(map.hasLayer(offleashLayer)){map.removeLayer(offleashLayer)}});let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>map?.invalidateSize({pan:false}),120)},{passive:true});
}
function allReports(){return loadJSON(STORAGE.reports,[])}
function matchesFilter(r){const species=profile()?.speciesContext||'dog';if(r.species&&species!=='both'&&r.species!=='both'&&r.species!==species)return false;if(activeFilter==='all')return true;if(activeFilter==='offleash')return false;return r.type===activeFilter}
function drawReports(){if(!reportLayer)return;reportLayer.clearLayers();allReports().filter(matchesFilter).forEach(r=>{const type=reportTypes.find(t=>t.id===r.type)||reportTypes[0];const icon=L.divIcon({className:'',html:`<div class="marker-badge marker-${type.marker}">${type.icon}</div>`,iconSize:[39,39],iconAnchor:[20,20]});L.marker([r.lat,r.lng],{icon}).on('click',()=>openReportDetail(r)).addTo(reportLayer)})}
function zoomToDogAreas(){if(!offleashLayer?.getLayers().length){toast('De losloopgebieden worden nog geladen…');return}const bounds=offleashLayer.getBounds();if(bounds.isValid())map.fitBounds(bounds,{paddingTopLeft:[28,135],paddingBottomRight:[28,210],maxZoom:15})}
function setupFilters(){el('filterRow')?.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active',x===b));drawReports();if(activeFilter==='offleash'){if(!map.hasLayer(offleashLayer))offleashLayer.addTo(map);el('offleashToggle').checked=true;zoomToDogAreas()}})}
function locateUser(){if(!navigator.geolocation){toast('Locatie wordt niet ondersteund op dit toestel');return}toast('Even snuffelen naar je locatie…');navigator.geolocation.getCurrentPosition(pos=>{const{latitude,longitude}=pos.coords;map.setView([latitude,longitude],16);L.circleMarker([latitude,longitude],{radius:8,color:'#176fa8',fillColor:'#79bce8',fillOpacity:1,weight:3}).addTo(map).bindPopup('Jij bent hier — deze locatie wordt niet openbaar gedeeld.').openPopup()},()=>toast('Locatie niet gedeeld. De kaart blijft gewoon werken.'),{enableHighAccuracy:false,timeout:8000,maximumAge:60000})}

async function geocodePlace(place){const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&accept-language=nl&q='+encodeURIComponent(place);const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('geocoding-failed');const results=await response.json();if(!Array.isArray(results)||!results.length)return null;const first=results[0],lat=Number(first.lat),lng=Number(first.lon);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;const a=first.address||{};return{lat,lng,label:a.city||a.town||a.village||a.municipality||place}}
function setupProfile(){
  const grid=el('avatarGrid');
  grid.innerHTML=avatars.map((a,i)=>`<button type="button" class="avatar-choice ${i===0?'selected':''}" data-avatar="${a}" aria-label="Avatar ${i+1}">${a}</button>`).join('');
  grid.addEventListener('click',e=>{const b=e.target.closest('[data-avatar]');if(!b)return;selectedAvatar=b.dataset.avatar;document.querySelectorAll('.avatar-choice').forEach(x=>x.classList.toggle('selected',x===b))});
  el('editProfile')?.addEventListener('click',()=>openProfileDialog());
  el('onboardingForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=el('onboardingName').value.trim(),place=el('onboardingHome').value.trim();
    if(!name){toast('Vul eerst een naam in 🐾');return}if(!place){toast('Waar woont je hond? 🐕');return}
    const btn=el('saveProfile'),old=btn.innerHTML;btn.disabled=true;btn.textContent='Even snuffelen naar je woonplaats…';
    try{const found=await geocodePlace(place);if(!found){toast('Die plaats kon ik niet vinden. Probeer bijvoorbeeld “Nijkerk, Gelderland”.');return}const before=profile();const speciesContext=document.querySelector('input[name="speciesContext"]:checked')?.value||before?.speciesContext||'dog';const next={...(before||{}),name,avatar:selectedAvatar,speciesContext,homePlace:found.label,homeLat:found.lat,homeLng:found.lng,createdAt:before?.createdAt||new Date().toISOString()};saveJSON(STORAGE.profile,next);updateProfileUI();document.dispatchEvent(new CustomEvent('wd:profile-updated',{detail:{profile:next}}));if(map)map.setView([found.lat,found.lng],14);el('onboardingDialog').close();showView('map');toast(`Welkom, ${name}! We openen rond ${found.label}`)}catch(err){console.warn(err);toast('Woonplaats opzoeken lukt nu niet. Probeer het nog eens.')}finally{btn.disabled=false;btn.innerHTML=old}
  });
  updateProfileUI();
  const p=profile();if(!p||!p.homePlace)setTimeout(()=>{if(!profile()?.homePlace)openProfileDialog(true)},220)
}
function openProfileDialog(first=false){const p=profile();el('onboardingName').value=p?.name||'';el('onboardingHome').value=p?.homePlace||'';selectedAvatar=p?.avatar||avatars[0];document.querySelectorAll('.avatar-choice').forEach(x=>x.classList.toggle('selected',x.dataset.avatar===selectedAvatar));if(!el('onboardingDialog').open)el('onboardingDialog').showModal();if(first)setTimeout(()=>el('onboardingName').focus(),120)}
function updateProfileUI(){const p=profile(),avatar=p?.avatar||'🐶',name=p?.name||'Jouw hond';el('profileQuickAvatar').textContent=avatar;el('navProfileAvatar').textContent=avatar;el('profileAvatarBig').textContent=avatar;el('profileName').textContent=name;el('profileBreed').textContent=p?.breed||'Ras nog niet gekozen';el('profileSubtitle').textContent=p?.homePlace?`Woont in ${p.homePlace} · klaar om te snuffelen`:(p?'Klaar om te snuffelen':'Maak je hondenprofiel af');el('myReportCount').textContent=allReports().length}

function setupReports(){
  if(!el('lostKinds')){const box=document.createElement('div');box.id='lostKinds';box.className='subtype-grid hidden';box.innerHTML='<button type="button" class="subtype" data-lost-kind="missing">🚨 Vermiste hond</button><button type="button" class="subtype" data-lost-kind="found">🐶 Gevonden hond</button>';el('reportDetails')?.prepend(box)}
  el('reportFab')?.addEventListener('click',()=>{resetReportForm();el('reportDialog').showModal()});
  el('reportTypes').innerHTML=reportTypes.map(t=>`<button type="button" class="report-type" data-report-type="${t.id}"><span>${t.icon}</span>${t.label}</button>`).join('');
  el('vegetationKinds').innerHTML=vegetationKinds.map(v=>`<button type="button" class="subtype" data-subtype="${v}">${v}</button>`).join('');
  el('reportTypes').addEventListener('click',e=>{const b=e.target.closest('[data-report-type]');if(!b)return;selectedReportType=b.dataset.reportType;selectedVegetation=null;selectedLostKind=null;document.querySelectorAll('.report-type').forEach(x=>x.classList.toggle('selected',x===b));el('reportDetails').classList.remove('hidden');el('vegetationKinds').classList.toggle('hidden',selectedReportType!=='vegetation');el('lostKinds')?.classList.toggle('hidden',selectedReportType!=='lost')});
  el('lostKinds')?.addEventListener('click',e=>{const b=e.target.closest('[data-lost-kind]');if(!b)return;selectedLostKind=b.dataset.lostKind;document.querySelectorAll('[data-lost-kind]').forEach(x=>x.classList.toggle('selected',x===b))});
  el('vegetationKinds').addEventListener('click',e=>{const b=e.target.closest('[data-subtype]');if(!b)return;selectedVegetation=b.dataset.subtype;document.querySelectorAll('.subtype').forEach(x=>x.classList.toggle('selected',x===b))});
  el('reportForm').addEventListener('submit',e=>{e.preventDefault();if(!selectedReportType){toast('Kies eerst wat je hebt gespot');return}if(selectedReportType==='vegetation'&&!selectedVegetation){toast('Welke vegetatie heb je gezien?');return}if(selectedReportType==='lost'&&!selectedLostKind){toast('Kies vermist of gevonden');return}const center=map.getCenter(),p=profile(),species=document.querySelector('input[name="reportSpecies"]:checked')?.value||p?.speciesContext||'both',animal=species==='cat'?'kat':species==='dog'?'hond':'huisdier',sub=selectedReportType==='lost'?(selectedLostKind==='missing'?`Vermiste ${animal}`:`Gevonden ${animal}`):selectedVegetation,text=el('reportText').value.trim()||defaultReportText(selectedReportType,sub),reports=allReports();reports.push({id:crypto.randomUUID?.()||String(Date.now()),type:selectedReportType,species,subtype:sub,text,lat:center.lat,lng:center.lng,time:'Zojuist',author:p?.name||'Anoniem',confirmed:0,_shareIntent:true});saveJSON(STORAGE.reports,reports);drawReports();updateProfileUI();el('reportDialog').close();toast('Dankjewel! Je melding staat op de kaart.')})
}
function resetReportForm(){selectedReportType=null;selectedVegetation=null;selectedLostKind=null;el('reportText').value='';el('reportDetails').classList.add('hidden');el('vegetationKinds').classList.add('hidden');document.querySelectorAll('.report-type,.subtype').forEach(x=>x.classList.remove('selected'));el('reportLocationText').textContent='Plaats op het midden van de kaart'}
function defaultReportText(type,sub){const t=reportTypes.find(x=>x.id===type);return sub?`${sub} gespot — voorzichtig met je hond.`:`${t?.label||'Melding'} gespot.`}
function markReportResolved(r){const rows=allReports().map(x=>x.id===r.id?{...x,resolved:true}:x);saveJSON(STORAGE.reports,rows);drawReports();updateProfileUI();el('detailDialog')?.close();toast('Melding gemarkeerd als opgelost')}
function deleteReport(r){if(!confirm('Deze melding van dit toestel wissen?'))return;const hidden=loadJSON(STORAGE.hiddenReports,[]);if(r?.id&&!hidden.includes(r.id))hidden.push(r.id);saveJSON(STORAGE.hiddenReports,hidden);saveJSON(STORAGE.reports,allReports().filter(x=>x.id!==r.id));drawReports();updateProfileUI();el('detailDialog')?.close();toast('Melding gewist')}
function openReportDetail(r){const t=reportTypes.find(x=>x.id===r.type)||reportTypes[0];const canManage=!r._remote||(r.userId&&r.userId===window.WhatsupDogCommunity?.user?.id);const ownerActions=canManage?'<div class="detail-actions"><button type="button" class="outline-btn" id="resolveReport">✓ Melding opgelost</button><button type="button" class="outline-btn danger-action" id="deleteReport">⌫ Melding wissen</button></div>':'';el('detailContent').innerHTML=`<div class="detail-icon">${t.icon}</div><h2>${escapeHTML(r.subtype||t.label)}</h2><div class="detail-meta">${escapeHTML(r.time)} · gemeld door ${escapeHTML(r.author||'hondenbezitter')}</div><p class="detail-body">${escapeHTML(r.text)}</p>${ownerActions}`;el('detailDialog').showModal();if(canManage){el('resolveReport').onclick=()=>markReportResolved(r);el('deleteReport').onclick=()=>deleteReport(r)}}

function areaCenter(area){if(area.center)return area.center;if(area.polygon?.length){const sum=area.polygon.reduce((a,p)=>[a[0]+p[0],a[1]+p[1]],[0,0]);return[sum[0]/area.polygon.length,sum[1]/area.polygon.length]}return[52.2182,5.4835]}
window.openDogAreaDetail=function(area){currentArea=area;el('areaName').textContent=area.name;el('areaMeta').textContent=`${area.type==='omheind'?'Omheind · ':''}Gemeente Nijkerk`;el('areaDescription').textContent=area.type==='omheind'?'Een omheinde plek waar honden vrij kunnen bewegen en baasjes elkaar kunnen ontmoeten.':'Een vastgesteld losloopgebied met ruimte om te snuffelen, spelen en samen op pad te gaan.';if(!el('areaDialog').open)el('areaDialog').showModal()}
function setupAreaDetail(){el('areaShowMap')?.addEventListener('click',()=>{if(!currentArea)return;const c=areaCenter(currentArea);el('areaDialog').close();showView('map');setTimeout(()=>map.setView(c,16),80)});el('areaRoute')?.addEventListener('click',()=>{if(!currentArea)return;const c=areaCenter(currentArea);window.open(`https://www.google.com/maps/dir/?api=1&destination=${c[0]},${c[1]}`,'_blank','noopener')})}

function registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{})}

setupDialogs();setupNavigation();initMap();setupProfile();setupReports();setupAreaDetail();
registerServiceWorker();

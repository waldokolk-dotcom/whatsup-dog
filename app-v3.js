
(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.WHATSUP_DOG_BACKEND||{};
const VAPID_PUBLIC="BJesefPp3yqkp5xgNwjSlg1xV6URHdadTi9Xo9oHUwuCSEEGWPBnVssL8_zl2gHo-EeVmdjuIuZ6XUSH3Tr4PQY";
const PKEY="wd_v3_profile", SKEY="wd_v3_settings";
const APP_VERSION="4.4.1", APP_VERSION_DATE="01-10-2026";
let client,user,map,markers,offleashLayer,reportLocationMap,reportLocationMarker,reportState={category:null,type:null,subtype:null,locationMode:"gps",location:null},deferredInstall=null;
const read=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}, write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const profile=()=>read(PKEY,{}), settings=()=>read(SKEY,{areaLabel:"Nijkerk",lat:52.2182,lng:5.4835,radius:2000,categories:["danger","lost","animal"],push:false});
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2400)};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function boot(){
 if(!window.supabase||!CFG.url||!CFG.publishableKey){toast("Backend niet beschikbaar");return}
 client=window.supabase.createClient(CFG.url,CFG.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data}=await client.auth.getSession(); if(data.session) user=data.session.user;
 if(!user){const r=await client.auth.signInAnonymously();if(r.error){console.warn(r.error);toast("Veilige toestelsessie kon niet starten");return}user=r.data.user}
 initMap(); bind(); syncPushUi(); applyProfile();
 await refreshReports().catch(err=>console.warn("Meldingen laden",err));
 await refreshGiveaways().catch(err=>console.warn("Weggeefhoek laden",err));
 await refreshMine().catch(err=>console.warn("Mijn Whatsup laden",err));
 window.addEventListener("pageshow",()=>{map?.invalidateSize();refreshReports().catch(()=>{})});
 if(!localStorage.getItem("wd_v3_onboarded")) $("#onboarding").showModal();
 const qp=new URLSearchParams(location.search).get("report");if(qp)setTimeout(()=>openReportById(qp),700);
}
function bind(){
 $$("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
 $("#pawFab").addEventListener("click",()=>$("#pawDialog").showModal());
 $("#pawReport").addEventListener("click",()=>{$("#pawDialog").close();openReport()});
 $("#pawGive").addEventListener("click",()=>{$("#pawDialog").close();showView("giveaway")});
 $("#pawArea").addEventListener("click",()=>{$("#pawDialog").close();$("#areaDialog").showModal()});
 $("#pawMine").addEventListener("click",()=>{$("#pawDialog").close();showView("my")});
 $("#pawInfo").addEventListener("click",()=>{$("#pawDialog").close();showView("info")});
 $("#mapAlerts")?.addEventListener("click",()=>showView("alerts"));
 $("#myAlertsShortcut")?.addEventListener("click",()=>showView("my"));
 $("#alertAreaButton")?.addEventListener("click",()=>$("#areaDialog").showModal());
 $("#myAreaLink")?.addEventListener("click",()=>$("#areaDialog").showModal());
 $("#myPushLink")?.addEventListener("click",()=>showView("alerts"));
 $("#myInfoLink")?.addEventListener("click",()=>showView("info"));
 $("#editProfileButton")?.addEventListener("click",()=>$("#profileEditor").classList.remove("hidden"));
 $("#closeProfileEditor")?.addEventListener("click",()=>$("#profileEditor").classList.add("hidden"));
 $("#myReportsCard")?.addEventListener("click",()=>$("#myReports").classList.toggle("hidden"));
 $("#myGiveCard")?.addEventListener("click",()=>$("#myGive").classList.toggle("hidden"));
 $$("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog")?.close()));
 $("#areaPill").addEventListener("click",()=>$("#areaDialog").showModal());
 $("#locateBtn").addEventListener("click",locate);
 $("#offleashToggle")?.addEventListener("change",toggleOffleashLayer);
 $("#areaForm").addEventListener("submit",saveArea);
 $("#reportForm").addEventListener("submit",submitReport);
 $("#reportUseGps")?.addEventListener("click",useCurrentReportLocation);
 $("#reportChooseMap")?.addEventListener("click",chooseReportLocationOnMap);
 $$(".report-type").forEach(b=>b.addEventListener("click",()=>chooseReport(b.dataset.cat,b.dataset.type,b.dataset.subtype||"")));
 $("#giveCreate").addEventListener("click",()=>$("#giveDialog").showModal());
 $("#giveForm").addEventListener("submit",submitGiveaway);
 $("#profileForm").addEventListener("submit",saveProfile);
 $("#pushToggle").addEventListener("change",togglePush);
 $("#pushTestButton")?.addEventListener("click",testPushNotification);
 $("#radius").addEventListener("input",e=>{$("#radiusVal").textContent=(e.target.value/1000).toFixed(e.target.value<1000?1:0)+" km"});$("#radius").addEventListener("change",savePushPrefs);
 $$(".push-cat").forEach(x=>x.addEventListener("change",savePushPrefs));
 $("#installButton").addEventListener("click",installApp);
 $("#checkUpdateButton")?.addEventListener("click",()=>checkForAppUpdate(true));
 $("#applyUpdateButton")?.addEventListener("click",applyAppUpdate);
 $("#onboardForm").addEventListener("submit",finishOnboarding);
 $("#onboardLocate").addEventListener("click",()=>navigator.geolocation?.getCurrentPosition(async p=>{const s=settings();s.lat=p.coords.latitude;s.lng=p.coords.longitude;s.areaLabel="Mijn locatie";write(SKEY,s);$("#onboardPlace").value="Mijn locatie";toast("Locatie gekozen")},()=>toast("Locatie niet gedeeld")));
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e});
}
function showView(v){
 $$(".view").forEach(x=>x.classList.toggle("active",x.id==="view-"+v));$$(".nav button").forEach(x=>x.classList.toggle("active",x.dataset.view===v));
 if(v==="map"){
   setTimeout(()=>map?.invalidateSize(),50);
   refreshReports().catch(err=>console.warn("Kaartmeldingen verversen",err));
 }
 if(v==="alerts"){syncPushUi();refreshReports();}
 if(v==="giveaway")refreshGiveaways();
 if(v==="my")refreshMine();
}
function initMap(){
 const s=settings();
 map=L.map("map",{zoomControl:false,attributionControl:true}).setView([s.lat,s.lng],14);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
 const reportPane=map.createPane("reportMarkersPane");
 reportPane.style.zIndex="720";
 reportPane.style.pointerEvents="auto";
 offleashLayer=L.layerGroup();
 markers=L.layerGroup().addTo(map);
 $("#areaPill").textContent=s.areaLabel+" ▾";
 const enabled=localStorage.getItem("wd_v3_offleash")!=="0";
 const toggle=$("#offleashToggle");if(toggle)toggle.checked=enabled;
 loadOffleashAreas(enabled);
}
async function loadOffleashAreas(enabled=true){
 if(!offleashLayer||!map)return;
 try{
   const res=await fetch("./data/nijkerk-losloopgebieden.geojson?v=20260930",{cache:"no-store"});
   if(!res.ok)throw new Error("GeoJSON "+res.status);
   const data=await res.json();
   offleashLayer.clearLayers();
   const geo=L.geoJSON(data,{
     style:{color:"#0879e6",weight:3,fillColor:"#47b9f4",fillOpacity:.32},
     onEachFeature:(feature,layer)=>{
       const p=feature.properties||{};
       const name=p.name||"Losloopgebied";
       layer.bindTooltip("🐕 "+name,{sticky:true,direction:"top"});
       layer.bindPopup('<div class="offleash-popup"><b>🐕 '+esc(name)+'</b><small>Losloopgebied · Gemeente Nijkerk · kaart 2026</small></div>');
       layer.on("mouseover",()=>layer.setStyle?.({fillOpacity:.5,weight:4}));
       layer.on("mouseout",()=>layer.setStyle?.({fillOpacity:.32,weight:3}));
     }
   });
   geo.eachLayer(layer=>layer.addTo(offleashLayer));
   if(enabled&&!map.hasLayer(offleashLayer))offleashLayer.addTo(map);
 }catch(err){
   console.warn("Losloopgebieden laden mislukt",err);
   $("#offleashControl")?.classList.add("hidden");
 }
}
function toggleOffleashLayer(e){
 const on=!!e.target.checked;
 localStorage.setItem("wd_v3_offleash",on?"1":"0");
 if(!offleashLayer)return;
 if(on){if(!map.hasLayer(offleashLayer))offleashLayer.addTo(map);toast("Losloopgebieden zichtbaar")}
 else{if(map.hasLayer(offleashLayer))map.removeLayer(offleashLayer);toast("Losloopgebieden verborgen")}
}
function markerIcon(r){const c=["danger","vegetation","dirty"].includes(r.type)?"#ff6b4a":r.type==="lost"?"#ef476f":r.type==="fun"||r.type==="walk"?"#28a17a":r.type==="road"?"#4f7fd7":"#5178db";const e=iconForReport(r);return L.divIcon({className:"wd-report-marker-icon",html:'<div class="marker" style="background:'+c+'"><span>'+e+'</span></div>',iconSize:[42,42],iconAnchor:[21,38]})}
async function refreshReports(){
 if(!client||!user)return;
 await client.rpc("archive_expired_reports").catch(()=>{});
 const {data,error}=await client.from("reports").select("id,user_id,author_name,author_avatar,type,subtype,text,lat,lng,photo_path,status,created_at,species,expires_at").eq("status","active").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}).limit(200);
 if(error){console.warn(error);return}
 markers.clearLayers();
 for(const r of data||[]){if(!Number.isFinite(Number(r.lat))||!Number.isFinite(Number(r.lng)))continue;L.marker([Number(r.lat),Number(r.lng)],{icon:markerIcon(r),pane:"reportMarkersPane",zIndexOffset:1000,reportId:r.id}).addTo(markers).on("click",()=>openReportDetail(r))}
 renderAlerts(data||[]);
}
function iconForReport(r){
 const sub=String(r.subtype||"").toLowerCase(),t=r.type;
 if(sub.includes("glas"))return "🔺";
 if(sub.includes("giftige plant"))return "🌿";
 if(sub.includes("vervuild water"))return "💧";
 if(sub.includes("gevaarlijk object"))return "🚧";
 if(sub.includes("agressief dier"))return "🐕";
 if(sub.includes("vermist"))return "❤️";
 if(sub.includes("gevonden"))return "🧡";
 if(sub.includes("afsluiting"))return "⛔";
 if(sub.includes("drukte"))return "🚗";
 if(sub.includes("ontmoeting"))return "🐕";
 if(sub.includes("activiteit"))return "🎈";
 if(t==="lost")return "❤️";
 if(t==="spotted")return "🐾";
 if(t==="fun"||t==="walk")return "💚";
 if(t==="road"||t==="other")return "💡";
 if(t==="vegetation")return "🌿";
 return "⚠️";
}
function classForReport(r){
 if(["danger","vegetation","dirty"].includes(r.type))return "orange";
 if(r.type==="lost")return "pink";
 if(r.type==="spotted")return "green";
 if(r.type==="road")return "blue";
 return "teal";
}
function renderAlerts(rows){
 const list=$("#alertsList"); if(!list)return;
 if(!rows.length){list.innerHTML='<div class="empty">Nog geen meldingen in jouw buurt.</div>';return}
 const s=settings(), now=Date.now();
 list.innerHTML=rows.slice(0,20).map(r=>{
   const minutes=Math.max(1,Math.round((now-new Date(r.created_at||now).getTime())/60000));
   const ago=minutes<60?minutes+" min":Math.round(minutes/60)+" u";
   const title=r.subtype||labelType(r.type);
   return '<button class="alert-item" data-alert-id="'+esc(r.id)+'"><span class="alert-dot '+classForReport(r)+'">'+iconForReport(r)+'</span><span><b>'+esc(title)+'</b><small>'+esc(r.text||"Melding in de buurt")+'</small></span><time>'+ago+'</time></button>'
 }).join("");
 list.querySelectorAll("[data-alert-id]").forEach(btn=>btn.onclick=async()=>{
   const id=btn.dataset.alertId;
   const {data}=await client.from("reports").select("*").eq("id",id).maybeSingle();
   if(data)openReportDetail(data);
 });
}
function removeReportMarker(id){
 if(!markers||!id)return;
 markers.eachLayer(layer=>{if(layer?.options?.reportId===id)markers.removeLayer(layer)});
}
async function deleteOwnReport(id){
 const {error}=await client.rpc("delete_own_report",{target:id});
 if(error)throw error;
 removeReportMarker(id);
 await Promise.allSettled([refreshMine(),refreshReports()]);
}
async function resolveOwnReport(id){
 const {error}=await client.rpc("resolve_own_report",{target:id});
 if(error)throw error;
 removeReportMarker(id);
 await Promise.allSettled([refreshMine(),refreshReports()]);
}
async function openReportById(id){return client.from("reports").select("*").eq("id",id).maybeSingle().then(({data})=>{if(data){showView("map");map.setView([data.lat,data.lng],16);openReportDetail(data)}})}
async function openReportDetail(r){
 $("#detailTitle").textContent=r.subtype||labelType(r.type);
 $("#detailText").textContent=r.text||"Melding";
 const expires=r.expires_at?new Date(r.expires_at):null;
 const expiryText=expires&&r.status==="active"?" · zichtbaar tot "+expires.toLocaleDateString("nl-NL"):"";
 $("#detailMeta").textContent=(r.author_name||"Buurtgenoot")+" · "+new Date(r.created_at||Date.now()).toLocaleString("nl-NL",{dateStyle:"short",timeStyle:"short"})+expiryText;
 const actions=$("#detailOwnerActions"),resolve=$("#detailResolve"),del=$("#detailDelete");
 const own=r.user_id===user?.id;
 actions.classList.toggle("hidden",!own);
 resolve.hidden=!own||r.status!=="active";
 resolve.onclick=async()=>{
   if(!confirm("Is dit opgelost? De melding verdwijnt direct van de kaart."))return;
   try{
     await resolveOwnReport(r.id);
     $("#detailDialog").close();
     toast("Opgelost — melding is van de kaart");
   }catch(err){console.warn(err);toast("Als opgelost markeren lukt niet")}
 };
 del.onclick=async()=>{
   if(!confirm("Deze melding definitief verwijderen?"))return;
   try{
     await deleteOwnReport(r.id);
     $("#detailDialog").close();
     toast("Melding verwijderd");
   }catch(err){console.warn(err);toast("Verwijderen mislukt")}
 };
 $("#detailDialog").showModal()
}
function labelType(t){return ({danger:"Gevaar",vegetation:"Vegetatie",road:"Handig",fun:"Leuk",spotted:"Dier",lost:"Vermist / gevonden"})[t]||"Melding"}
function openReport(){
 reportState={category:null,type:null,subtype:null,locationMode:"gps",location:null};
 $("#reportStep1").hidden=false;$("#reportStep2").hidden=true;$("#reportText").value="";$("#reportPhoto").value="";
 useCurrentReportLocation();
 $("#reportDialog").showModal()
}
function chooseReport(cat,type,sub){
 reportState={...reportState,category:cat,type,subtype:sub};
 $("#reportStep1").hidden=true;$("#reportStep2").hidden=false;
 $("#reportChosen").textContent=({danger:"Gevaar",animal:"Dier",handy:"Handig",fun:"Leuk"})[cat]||"Melding";
 renderSubChoices(cat);
 setTimeout(()=>reportLocationMap?.invalidateSize(),50)
}
function renderSubChoices(cat){
 const box=$("#reportSubs");
 const opts=cat==="danger"?[["danger","Glas","🔺"],["vegetation","Giftige planten","🌿"],["danger","Vervuild water","💧"],["danger","Gevaarlijk object","🚧"],["danger","Agressief dier","🐕"]]
 :cat==="animal"?[["spotted","Dier gezien","🐾"],["lost","Vermist dier","❤️"],["lost","Gevonden dier","🧡"]]
 :cat==="handy"?[["road","Afsluiting","⛔"],["road","Drukte","🚗"],["other","Tip","💡"]]
 :[["fun","Leuke plek","💚"],["walk","Ontmoeting","🐕"],["fun","Activiteit","🎈"]];
 box.innerHTML=opts.map((o,i)=>'<button type="button" class="chip '+(i===0?"active":"")+'" data-t="'+o[0]+'" data-s="'+esc(o[1])+'"><span class="chip-icon">'+o[2]+'</span>'+esc(o[1])+'</button>').join("");
 reportState.type=opts[0][0];reportState.subtype=opts[0][1];
 box.querySelectorAll("button").forEach(b=>b.onclick=()=>{box.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");reportState.type=b.dataset.t;reportState.subtype=b.dataset.s})
}
function useCurrentReportLocation(){
 reportState.locationMode="gps";reportState.location=null;
 $("#reportUseGps")?.classList.add("active");$("#reportChooseMap")?.classList.remove("active");
 $("#reportLocationMapWrap")?.classList.add("hidden");
 const s=$("#reportLocationStatus");if(s)s.textContent="Mijn huidige locatie wordt gebruikt.";
}
function chooseReportLocationOnMap(){
 reportState.locationMode="map";
 $("#reportUseGps")?.classList.remove("active");$("#reportChooseMap")?.classList.add("active");
 $("#reportLocationMapWrap")?.classList.remove("hidden");
 const center=reportState.location||map?.getCenter()||{lat:52.2182,lng:5.4835};
 if(!reportLocationMap){
   reportLocationMap=L.map("reportLocationMap",{zoomControl:true,attributionControl:false}).setView([center.lat,center.lng],16);
   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(reportLocationMap);
   reportLocationMarker=L.marker([center.lat,center.lng],{draggable:true}).addTo(reportLocationMap);
   const commit=ll=>{reportState.location={lat:ll.lat,lng:ll.lng};reportLocationMarker.setLatLng(ll);const s=$("#reportLocationStatus");if(s)s.textContent="Gekozen plek op de kaart wordt gebruikt."};
   reportLocationMap.on("click",e=>commit(e.latlng));
   reportLocationMarker.on("dragend",e=>commit(e.target.getLatLng()));
 }else{
   reportLocationMap.setView([center.lat,center.lng],16);reportLocationMarker.setLatLng([center.lat,center.lng]);
 }
 reportState.location={lat:center.lat,lng:center.lng};
 const status=$("#reportLocationStatus");if(status)status.textContent="Tik op de kaart of sleep de pin naar de juiste plek.";
 setTimeout(()=>reportLocationMap.invalidateSize(),50);
}
async function compress(file){if(!file)return null;if(file.size>7*1024*1024)throw new Error("Foto te groot");const bmp=await createImageBitmap(file),scale=Math.min(1,1400/Math.max(bmp.width,bmp.height)),c=document.createElement("canvas");c.width=Math.round(bmp.width*scale);c.height=Math.round(bmp.height*scale);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);bmp.close?.();return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("foto")),"image/jpeg",.82))}
async function submitReport(e){
 e.preventDefault();if(!user||!reportState.type)return;const btn=$("#reportSubmit");btn.disabled=true;
 try{let loc;
 if(reportState.locationMode==="map"&&reportState.location){loc=reportState.location}
 else if(navigator.geolocation){loc=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),rej,{timeout:6000,maximumAge:30000}))}
 else{throw new Error("location-unavailable")}
 const id=crypto.randomUUID(),p=profile();let photo_path=null,file=$("#reportPhoto").files[0];
 if(file){const blob=await compress(file);photo_path=user.id+"/"+id+".jpg";const up=await client.storage.from("report-photos").upload(photo_path,blob,{contentType:"image/jpeg",upsert:false});if(up.error)throw up.error}
 const row={id,user_id:user.id,author_name:(p.name||"Buurtgenoot").slice(0,40),author_avatar:p.avatar||"🐾",type:reportState.type,subtype:reportState.subtype||null,text:($("#reportText").value.trim()||reportState.subtype||"Nieuwe melding").slice(0,220),lat:loc.lat,lng:loc.lng,photo_path,species:p.species||"both"};
 const {error}=await client.from("reports").insert(row);if(error)throw error;
 $("#reportDialog").close();
 showView("map");
 map.setView([loc.lat,loc.lng],17);
 const optimistic={...row,status:"active",created_at:new Date().toISOString(),expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString()};
 L.marker([loc.lat,loc.lng],{icon:markerIcon(optimistic),pane:"reportMarkersPane",zIndexOffset:1200,reportId:id}).addTo(markers).on("click",()=>openReportDetail(optimistic));
 setTimeout(()=>map?.invalidateSize(),50);
 await Promise.allSettled([refreshReports(),refreshMine()]);
 map.setView([loc.lat,loc.lng],17);
 client.functions.invoke("dispatch-nearby-push",{body:{reportId:id}}).catch(()=>{});
 toast("Melding staat op de kaart")}
 catch(err){console.warn(err);toast("Plaatsen lukt nu niet")}finally{btn.disabled=false}
}
async function refreshGiveaways(){
 const list=$("#giveList");if(!list||!client)return;list.innerHTML='<div class="empty">Laden…</div>';const {data,error}=await client.from("giveaway_listings").select("id,owner_id,title,description,category,kind,town,image_path,status,created_at").eq("status","actief").order("created_at",{ascending:false}).limit(80);if(error){list.innerHTML='<div class="empty">Ophalen lukt nu niet.</div>';return}
 if(!data?.length){list.innerHTML='<div class="empty">Nog niets aangeboden. Jij kunt de eerste zijn.</div>';return}
 list.innerHTML="";
 for(const x of data){
   const a=document.createElement("article");a.className="give-card";
   const fallback=x.category==="kat"?"🐱":x.category==="hond"?"🐶":"🐾";
   let img='<div class="give-card-media">'+fallback+'</div>';
   if(x.image_path){
     const {data:s}=await client.storage.from("giveaway-photos").createSignedUrl(x.image_path,900);
     if(s?.signedUrl)img='<img class="give-card-media" src="'+s.signedUrl+'" alt="">'
   }
   a.innerHTML=img+'<div class="give-body"><span class="badge">'+(x.kind==="ruilen"?"Ruilen":"Gratis")+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><p class="muted small location">📍 '+esc(x.town)+'</p><button class="primary wide contact">✉️ Neem contact op</button></div>';
   a.querySelector(".contact").onclick=()=>contactGiveaway(x);
   list.append(a)
 }}
async function contactGiveaway(x){if(x.owner_id===user.id)return toast("Dit is jouw eigen item");const {data,error}=await client.rpc("get_giveaway_contact",{target:x.id});if(error||!data)return toast("Contactadres niet beschikbaar");location.href="mailto:"+encodeURIComponent(data)+"?subject="+encodeURIComponent("Reactie via Whatsup Dog – "+x.title)+"&body="+encodeURIComponent("Hallo,\n\nIk zag via Whatsup Dog dat je '"+x.title+"' aanbiedt. Is dit nog beschikbaar?\n\nGroet,")}
async function submitGiveaway(e){
 e.preventDefault();const f=e.currentTarget,b=$("#giveSubmit");b.disabled=true;let path=null;
 try{const id=crypto.randomUUID(),file=f.photo.files[0];if(file){const blob=await compress(file);path=user.id+"/"+id+".jpg";const up=await client.storage.from("giveaway-photos").upload(path,blob,{contentType:"image/jpeg",upsert:false});if(up.error)throw up.error}
 const args={listing_id:id,listing_title:f.title.value.trim(),listing_description:f.description.value.trim(),listing_category:f.category.value,listing_kind:f.kind.value,listing_town:f.town.value.trim(),listing_image_path:path,listing_contact_email:f.email.value.trim()};const {error}=await client.rpc("create_giveaway_listing",args);if(error)throw error;f.reset();$("#giveDialog").close();await refreshGiveaways();await refreshMine();toast("Item geplaatst")}
 catch(err){console.warn(err);toast("Plaatsen lukt nu niet")}finally{b.disabled=false}
}
async function refreshMine(){
 const p=profile(),s=settings();
 $("#myName").textContent=p.name||"Mijn Whatsup";
 $("#myMeta").textContent=[p.petName,p.breed,s.areaLabel].filter(Boolean).join(" · ")||"Persoonlijke instellingen";
 $("#myAvatar").textContent=p.avatar||"🐾";
 $("#myAvatarLarge").textContent=p.avatar||"🐾";
 $("#myAreaLabel").textContent=s.areaLabel||"Mijn gebied";
 $("#profileName").value=p.name||"";
 $("#petName").value=p.petName||"";
 $("#breed").value=p.breed||"";
 $("#avatar").value=p.avatar||"🐾";
 $("#species").value=p.species||"both";
 if(!client||!user)return;
 const [r,g]=await Promise.all([
   client.from("reports").select("id,text,status,created_at,expires_at,resolved_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50),
   client.from("giveaway_listings").select("id,title,status,created_at").eq("owner_id",user.id).order("created_at",{ascending:false}).limit(30)
 ]);
 const reports=r.data||[], gives=g.data||[];
 $("#myReportsCount").textContent=reports.filter(x=>x.status==="active").length;
 $("#myGiveCount").textContent=gives.length;
 $("#myReports").innerHTML=reports.map(x=>{
   const label=x.status==="active"?"Actief":x.status==="resolved"?"Opgelost":x.status==="expired"?"Verlopen":"Verborgen";
   const resolve=x.status==="active"?'<button class="primary small" data-resolve-report="'+x.id+'">✓ Markeer als opgelost</button>':"";
   const del='<button class="danger small" data-del-report="'+x.id+'">🗑 Verwijder melding</button>';
   return '<div class="my-item"><b>'+esc(x.text)+'</b><div class="row report-status-row"><small class="status-'+esc(x.status)+'">'+label+'</small><span class="report-own-actions">'+resolve+del+'</span></div></div>'
 }).join("")||'<div class="empty">Nog geen meldingen.</div>';
 $("#myGive").innerHTML=gives.map(x=>'<div class="my-item"><b>'+esc(x.title)+'</b><div class="row"><small>'+esc(x.status)+'</small><button class="secondary small" data-done-give="'+x.id+'">Afgehandeld</button></div></div>').join("")||'<div class="empty">Nog geen weggeefitems.</div>';
 $$("[data-resolve-report]").forEach(b=>b.onclick=async()=>{try{await resolveOwnReport(b.dataset.resolveReport);toast("Melding opgelost en van de kaart")}catch(err){console.warn(err);toast("Bijwerken mislukt")}});
 $$("[data-del-report]").forEach(b=>b.onclick=async()=>{if(!confirm("Deze melding definitief verwijderen? Dit kan niet ongedaan worden gemaakt."))return;try{await deleteOwnReport(b.dataset.delReport);toast("Melding verwijderd")}catch(err){console.warn(err);toast("Verwijderen mislukt")}});
 $$("[data-done-give]").forEach(b=>b.onclick=async()=>{await client.from("giveaway_listings").update({status:"afgerond",updated_at:new Date().toISOString()}).eq("id",b.dataset.doneGive).eq("owner_id",user.id);refreshMine();refreshGiveaways()})
}
function saveProfile(e){e.preventDefault();const p={name:$("#profileName").value.trim(),petName:$("#petName").value.trim(),breed:$("#breed").value.trim(),avatar:$("#avatar").value,species:$("#species").value};write(PKEY,p);applyProfile();toast("Opgeslagen")}
function applyProfile(){
 const p=profile(),s=settings();
 if($("#myAvatar"))$("#myAvatar").textContent=p.avatar||"🐾";
 if($("#myAvatarLarge"))$("#myAvatarLarge").textContent=p.avatar||"🐾";
 if($("#myName"))$("#myName").textContent=p.name||"Mijn Whatsup";
 if($("#myAreaLabel"))$("#myAreaLabel").textContent=s.areaLabel||"Mijn gebied";
 const town=$("#giveForm [name=\"town\"]"); if(town)town.value=s.areaLabel||"";
}
async function saveArea(e){e.preventDefault();const q=$("#areaSearch").value.trim();if(!q)return;try{const res=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=nl&q="+encodeURIComponent(q));const arr=await res.json();if(!arr[0])return toast("Gebied niet gevonden");const s=settings();s.areaLabel=arr[0].display_name.split(",")[0];s.lat=Number(arr[0].lat);s.lng=Number(arr[0].lon);write(SKEY,s);$("#areaPill").textContent=s.areaLabel+" ▾";map.setView([s.lat,s.lng],14);$("#areaDialog").close();syncPushUi();applyProfile();toast("Gebied aangepast")}catch{toast("Zoeken lukt nu niet")}}
function locate(){navigator.geolocation?.getCurrentPosition(p=>{map.setView([p.coords.latitude,p.coords.longitude],16);L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:8,color:"#176fa8",fillColor:"#7dc4ff",fillOpacity:1,weight:3}).addTo(map)},()=>toast("Locatie niet gedeeld"),{timeout:6000,maximumAge:30000})}
function urlB64(s){const pad="=".repeat((4-s.length%4)%4),b=(s+pad).replace(/-/g,"+").replace(/_/g,"/"),raw=atob(b);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isStandalone(){return window.matchMedia?.("(display-mode: standalone)")?.matches||window.navigator.standalone===true}
function setPushStatus(text,type=""){
 const el=$("#pushStatus"),help=$("#pushHelp"),test=$("#pushTestButton");
 if(el){el.textContent=text;el.className="push-status"+(type?" "+type:"")}
 if(test)test.classList.toggle("hidden",type!=="on");
 if(help&&type==="on"){help.classList.add("hidden");help.textContent=""}
}
function showPushHelp(message){
 const help=$("#pushHelp");
 if(!help)return;
 help.textContent=message;
 help.classList.remove("hidden");
}
async function getReadyRegistration(){
 if(!("serviceWorker" in navigator))throw new Error("service-worker-unsupported");
 let reg=await navigator.serviceWorker.getRegistration("./");
 if(!reg)reg=await navigator.serviceWorker.register("./sw.js");
 const ready=await Promise.race([
   navigator.serviceWorker.ready,
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("service-worker-timeout")),8000))
 ]);
 return ready;
}
function sameApplicationServerKey(sub){
 try{
   const current=sub?.options?.applicationServerKey;
   if(!current)return false;
   const expected=urlB64(VAPID_PUBLIC);
   const actual=new Uint8Array(current);
   if(actual.length!==expected.length)return false;
   return actual.every((v,i)=>v===expected[i]);
 }catch{return false}
}
async function ensurePushSubscription(){
 if(!("Notification" in window))throw new Error("notifications-unsupported");
 if(!("PushManager" in window))throw new Error("push-unsupported");
 if(!window.isSecureContext)throw new Error("secure-context-required");
 if(isIOS()&&!isStandalone())throw new Error("ios-install-required");
 if(Notification.permission==="denied")throw new Error("permission-denied");
 const permission=Notification.permission==="granted"?"granted":await Notification.requestPermission();
 if(permission!=="granted")throw new Error(permission==="denied"?"permission-denied":"permission-dismissed");
 const reg=await getReadyRegistration();
 let sub=await reg.pushManager.getSubscription();
 if(sub&&!sameApplicationServerKey(sub)){
   await client?.rpc("unregister_push_subscription",{p_endpoint:sub.endpoint}).catch(()=>{});
   await sub.unsubscribe().catch(()=>{});
   sub=null;
 }
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64(VAPID_PUBLIC)});
 await saveSubscription(sub);
 return sub;
}
function pushErrorMessage(err){
 const code=String(err?.message||err||"");
 if(code.includes("ios-install-required"))return "Op iPhone/iPad werkt push nadat je Whatsup Dog via Safari op je beginscherm hebt gezet en vanaf daar opent.";
 if(code.includes("permission-denied"))return "Meldingen zijn in je browser geblokkeerd. Zet meldingen voor deze site aan in de browser- of telefooninstellingen en probeer opnieuw.";
 if(code.includes("permission-dismissed"))return "Je hebt de toestemmingsvraag gesloten. Tik opnieuw op de schakelaar om het nogmaals te proberen.";
 if(code.includes("notifications-unsupported")||code.includes("push-unsupported"))return "Deze browser ondersteunt geen web-push. Gebruik een recente versie van Chrome, Edge, Safari of de geïnstalleerde app.";
 if(code.includes("service-worker"))return "De app-service kon niet starten. Sluit Whatsup Dog volledig, open opnieuw en probeer nogmaals.";
 if(code.includes("secure-context-required"))return "Push werkt alleen via de beveiligde https-versie van Whatsup Dog.";
 if(code.includes("NotAllowedError"))return "De browser of je laptop blokkeert meldingen. Sta meldingen toe voor Whatsup Dog en controleer ook de meldingsinstellingen van Windows/macOS.";
 if(code.includes("AbortError")||code.includes("InvalidStateError"))return "De oude browserregistratie kon niet worden hersteld. Zet push één keer uit en weer aan; Whatsup Dog maakt dan een nieuwe inschrijving.";
 return "Push kon niet worden geactiveerd. Controleer de meldingsrechten van Whatsup Dog in je browser én in Windows/macOS en probeer opnieuw.";
}
async function togglePush(e){
 const toggle=e.target;
 toggle.disabled=true;
 if(toggle.checked){
   setPushStatus("Push wordt ingeschakeld…");
   try{
     await ensurePushSubscription();
     const s=settings();s.push=true;write(SKEY,s);
     setPushStatus("Pushmeldingen staan aan","on");
     toast("Pushmeldingen staan aan");
   }catch(err){
     console.warn("Push enable failed",err);
     toggle.checked=false;
     const s=settings();s.push=false;write(SKEY,s);
     setPushStatus("Pushmeldingen staan uit","error");
     showPushHelp(pushErrorMessage(err));
     toast("Pushmeldingen niet ingeschakeld");
   }finally{toggle.disabled=false}
 }else{
   try{
     const reg=await navigator.serviceWorker.getRegistration("./");
     const sub=reg?await reg.pushManager.getSubscription():null;
     if(sub){
       await client.rpc("unregister_push_subscription",{p_endpoint:sub.endpoint}).catch(()=>{});
       await sub.unsubscribe().catch(()=>{});
     }
   }catch(err){console.warn("Push disable failed",err)}
   const s=settings();s.push=false;write(SKEY,s);
   setPushStatus("Pushmeldingen staan uit");
   toggle.disabled=false;
   toast("Pushmeldingen staan uit");
 }
}
async function saveSubscription(sub){
 const s=settings(),j=sub.toJSON();
 const {error}=await client.rpc("register_push_subscription",{
   p_endpoint:sub.endpoint,
   p_p256dh:j.keys?.p256dh,
   p_auth:j.keys?.auth,
   p_area_label:s.areaLabel||"",
   p_center_lat:Number(s.lat),
   p_center_lng:Number(s.lng),
   p_radius_m:Number(s.radius||2000),
   p_categories:s.categories||[]
 });
 if(error)throw error;
}
async function savePushPrefs(){
 const s=settings();
 s.radius=Number($("#radius").value);
 s.categories=$$(".push-cat:checked").map(x=>x.value);
 write(SKEY,s);
 $("#radiusVal").textContent=(s.radius/1000).toFixed(s.radius<1000?1:0)+" km";
 try{
   const reg=await navigator.serviceWorker.getRegistration("./"),sub=reg?await reg.pushManager.getSubscription():null;
   if(sub)await saveSubscription(sub);
 }catch(err){console.warn("Push preferences sync failed",err)}
}
async function testPushNotification(){
 try{
   setPushStatus("Laptop/browser wordt gecontroleerd…");
   await ensurePushSubscription();
   const reg=await getReadyRegistration();
   await reg.showNotification("Whatsup Dog",{
     body:"Test geslaagd — pushmeldingen werken op dit apparaat.",
     icon:"./icon-192.png",badge:"./icon-192.png",tag:"whatsup-dog-test",
     renotify:true
   });
   const s=settings();s.push=true;write(SKEY,s);
   setPushStatus("Pushmeldingen staan aan","on");
   toast("Testmelding verstuurd");
 }catch(err){
   console.warn("Push test failed",err);
   setPushStatus("Pushcontrole mislukt","error");
   showPushHelp(pushErrorMessage(err));
 }
}
function syncPushUi(){
 const s=settings();
 const area=document.querySelector("#pushArea");
 const radius=document.querySelector("#radius");
 const radiusVal=document.querySelector("#radiusVal");
 const toggle=document.querySelector("#pushToggle");
 const myArea=document.querySelector("#myAreaLabel");
 if(area)area.textContent=s.areaLabel||"Mijn gebied";
 if(myArea)myArea.textContent=s.areaLabel||"Mijn gebied";
 if(toggle)toggle.checked=!!s.push;
 if("Notification" in window&&Notification.permission==="denied"){
   if(toggle)toggle.checked=false;
   setPushStatus("Geblokkeerd door browser","error");
   showPushHelp(pushErrorMessage(new Error("permission-denied")));
 }else if(s.push){
   setPushStatus("Pushmeldingen staan aan","on");
   setTimeout(()=>ensurePushSubscription().catch(err=>{
     console.warn("Push subscription repair failed",err);
     if(toggle)toggle.checked=false;
     const next=settings();next.push=false;write(SKEY,next);
     setPushStatus("Push opnieuw inschakelen","error");
     showPushHelp(pushErrorMessage(err));
   }),0);
 }else setPushStatus("Niet ingeschakeld");
 if(radius)radius.value=String(s.radius||2000);
 if(radiusVal)radiusVal.textContent=((s.radius||2000)/1000)+" km";
 document.querySelectorAll(".push-cat").forEach(x=>x.checked=(s.categories||[]).includes(x.value));
}
async function finishOnboarding(e){e.preventDefault();const place=$("#onboardPlace").value.trim(),p={species:$("input[name=onSpecies]:checked")?.value||"both",avatar:"🐾",name:"",petName:"",breed:""};write(PKEY,p);if(place&&place!=="Mijn locatie"){try{const r=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=nl&q="+encodeURIComponent(place)),a=await r.json();if(a[0]){const s=settings();s.areaLabel=a[0].display_name.split(",")[0];s.lat=+a[0].lat;s.lng=+a[0].lon;write(SKEY,s)}}catch{}}localStorage.setItem("wd_v3_onboarded","1");$("#onboarding").close();location.reload()}
async function installApp(){if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;return}toast(/iphone|ipad|ipod/i.test(navigator.userAgent)?"Tik Deel en kies ‘Zet op beginscherm’":"Open het browsermenu en kies ‘App installeren’")}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e});

let updateRegistration=null, updateWorker=null, updateReloading=false;

function syncVersionUi(){
 const v=$("#appVersion"),d=$("#versionDate");
 if(v)v.textContent="Whatsup Dog "+APP_VERSION;
 if(d)d.textContent="Bijgewerkt "+APP_VERSION_DATE;
}

function showUpdateBanner(worker,registration){
 updateWorker=worker||registration?.waiting||null;
 updateRegistration=registration||updateRegistration;
 const banner=$("#updateBanner"),btn=$("#applyUpdateButton");
 if(btn){btn.disabled=false;btn.textContent="Nu bijwerken"}
 if(banner)banner.classList.remove("hidden");
}
function hideUpdateBanner(){
 const banner=$("#updateBanner"),btn=$("#applyUpdateButton");
 if(banner)banner.classList.add("hidden");
 if(btn){btn.disabled=false;btn.textContent="Nu bijwerken"}
}

async function registerUpdateSystem(){
 syncVersionUi();
 if(!("serviceWorker" in navigator))return;
 try{
   const reg=await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});
   updateRegistration=reg;

   if(reg.waiting&&navigator.serviceWorker.controller)showUpdateBanner(reg.waiting,reg);

   reg.addEventListener("updatefound",()=>{
     const worker=reg.installing;
     if(!worker)return;
     worker.addEventListener("statechange",()=>{
       if(worker.state==="installed"&&navigator.serviceWorker.controller){
         showUpdateBanner(worker,reg);
       }
     });
   });

   navigator.serviceWorker.addEventListener("controllerchange",()=>{
     hideUpdateBanner();
     if(updateReloading)return;
     updateReloading=true;
     location.reload();
   });

   const ask=()=>checkForAppUpdate(false);
   window.addEventListener("focus",ask);
   document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")ask()});
   setInterval(ask,60*60*1000);
 }catch(err){console.warn("Updatecontrole kon niet starten",err)}
}

async function checkForAppUpdate(userRequested=false){
 if(!("serviceWorker" in navigator))return;
 try{
   const reg=updateRegistration||await navigator.serviceWorker.getRegistration("./")||await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});
   updateRegistration=reg;
   await reg.update();
   if(reg.waiting&&navigator.serviceWorker.controller){
     showUpdateBanner(reg.waiting,reg);
     if(userRequested)toast("Nieuwe versie is klaar");
   }else if(userRequested){
     toast("Je gebruikt de nieuwste versie");
   }
 }catch(err){
   console.warn("Updatecontrole mislukt",err);
   if(userRequested)toast("Updatecontrole lukt nu niet");
 }
}

async function applyAppUpdate(){
 const banner=$("#updateBanner"),btn=$("#applyUpdateButton");
 const worker=updateWorker||updateRegistration?.waiting;

 // Directe visuele feedback: een tweede tik is nooit nodig.
 if(banner)banner.classList.add("hidden");
 if(btn){btn.disabled=true;btn.textContent="Bijwerken…"}

 if(!worker){
   hideUpdateBanner();
   await checkForAppUpdate(true);
   return;
 }

 updateReloading=false;
 try{
   worker.postMessage({type:"SKIP_WAITING"});
 }catch(err){
   console.warn("Update activeren mislukt",err);
   hideUpdateBanner();
   toast("Bijwerken lukt nu niet — probeer opnieuw");
   return;
 }

 // Safari/iOS geeft controllerchange niet altijd direct door.
 // Als de nieuwe worker al actief is of de melding uitblijft, herladen we veilig zelf.
 const started=Date.now();
 const fallback=setInterval(()=>{
   const waiting=updateRegistration?.waiting;
   if(!waiting||Date.now()-started>4500){
     clearInterval(fallback);
     if(!updateReloading){
       updateReloading=true;
       location.reload();
     }
   }
 },250);
 setTimeout(()=>{
   clearInterval(fallback);
   if(!updateReloading){
     updateReloading=true;
     location.reload();
   }
 },5000);
}

registerUpdateSystem();
boot().catch(e=>{console.error(e);toast("Whatsup Dog kon niet volledig starten")});
})();

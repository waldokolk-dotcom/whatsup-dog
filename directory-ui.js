(()=>{
'use strict';
const $=id=>document.getElementById(id);
const profile=()=>{try{return JSON.parse(localStorage.getItem('wd_profile_v1')||'null')}catch{return null}};
const account=()=>window.WhatsupDogCommunity;
const verified=()=>Boolean(account()?.client&&account()?.user&&!account().user.is_anonymous);
const status=(message,ok)=>{const s=$('directoryOptInStatus');if(!s)return;s.textContent=message;s.classList.toggle('is-ready',Boolean(ok))};
let busy=false,revision=0;
function inject(){
 const parent=document.querySelector('#view-profile .settings-card.compact');if(!parent||$('directoryOptInRow'))return;
 const row=document.createElement('label');row.className='switch-row directory-switch';row.id='directoryOptInRow';
 row.innerHTML='<span><b>👋 Vindbaar in Whatsup Dog</b><small>Alleen als jij dit aanzet, kunnen buurtgenoten je profielnaam, avatar, diersoort en woonplaats zien en een chat beginnen. Je e-mail en exacte locatie blijven privé.</small><small id="directoryOptInStatus" class="directory-switch-status" role="status" aria-live="polite">Verbinding controleren…</small></span><input id="directoryOptIn" type="checkbox" disabled aria-describedby="directoryOptInStatus">';
 parent.append(row);$('directoryOptIn').addEventListener('change',save);
}
async function load(){
 const seq=++revision,toggle=$('directoryOptIn');if(!toggle)return;
 toggle.disabled=true;
 if(window.__WD_PREVIEW__){toggle.checked=false;status('Proefversie is alleen-lezen. In de live-app kun je dit na inloggen aanzetten.',false);return}
 if(!verified()){
   toggle.checked=false;
   status(account()?.user?.is_anonymous?'Log eerst in met een geverifieerd account om vindbaar te worden.':'Meld je aan om vindbaar te worden.',false);
   return;
 }
 try{
   const {data,error}=await account().client.from('profiles').select('discoverable').eq('id',account().user.id).maybeSingle();
   if(error)throw error;if(seq!==revision)return;
   toggle.checked=Boolean(data?.discoverable);toggle.disabled=false;
   status(toggle.checked?'Vindbaar: anderen kunnen je vinden en een gesprek beginnen.':'Niet vindbaar: alleen jij ziet je profiel.',true);
 }catch(err){if(seq!==revision)return;console.warn('Vindbaarheid ophalen mislukt',err);status('Profiel ophalen lukt nu niet. Probeer opnieuw door je profiel opnieuw te openen.',false)}
}
async function save(event){
 const toggle=event.target,requested=toggle.checked,previous=!requested;
 toggle.disabled=true;
 if(window.__WD_PREVIEW__||!verified()){toggle.checked=previous;await load();return}
 const p=profile();
 if(!p?.name){toggle.checked=previous;status('Vul eerst je profielnaam in.',false);toggle.disabled=false;return}
 busy=true;const seq=++revision;
 try{
   const {data,error}=await account().client.rpc('set_profile_discoverability',{
     enabled:requested,profile_name:String(p.name).trim().slice(0,40),
     profile_avatar:String(p.avatar||'🐾').slice(0,16),
     profile_place:String(p.homePlace||'').slice(0,80),
     pet_breed:String(p.breed||'').slice(0,80)
   });
   if(error)throw error;
   const {data:check,error:readError}=await account().client.from('profiles').select('discoverable').eq('id',account().user.id).maybeSingle();
   if(readError||!check||Boolean(check.discoverable)!==requested)throw readError||new Error('Server did not confirm opt-in');
   if(seq!==revision)return;
   toggle.checked=Boolean(data);status(requested?'Je profiel is vindbaar. Je kunt nu chats ontvangen.':'Vindbaarheid is uitgeschakeld.',true);
   document.dispatchEvent(new CustomEvent('wd:directory-updated'));
 }catch(err){
   console.warn('Vindbaarheid opslaan mislukt',err);if(seq!==revision)return;
   toggle.checked=previous;
   status('Opslaan is niet bevestigd. Controleer de verbinding en probeer opnieuw.',false);
 }finally{busy=false;if(seq===revision)toggle.disabled=!verified()||Boolean(window.__WD_PREVIEW__)}
}
function boot(){
 inject();load();
 document.addEventListener('wd:auth-changed',()=>{if(!busy)load()});
 document.addEventListener('wd:community-status',()=>{if(!busy&&!$('directoryOptIn')?.disabled)return;if(!busy)load()});
 document.querySelector('.bottom-nav [data-view="profile"]')?.addEventListener('click',()=>{if(!busy)load()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

(()=>{
'use strict';
const $=id=>document.getElementById(id);
const profile=()=>{try{return JSON.parse(localStorage.getItem('wd_profile_v1')||'null')}catch{return null}};
const account=()=>window.WhatsupDogCommunity;
const verified=()=>Boolean(account()?.client&&account()?.user&&!account().user.is_anonymous);
const status=(message,ok)=>{const s=$('directoryOptInStatus');if(!s)return;s.textContent=message;s.classList.toggle('is-ready',Boolean(ok))};
let busy=false,revision=0,serverProfile=null;
function inject(){
 const parent=document.querySelector('#view-profile .settings-card.compact');if(!parent||$('directoryOptInRow'))return;
 const row=document.createElement('label');row.className='switch-row directory-switch';row.id='directoryOptInRow';
 row.innerHTML='<span><b>👋 Anderen mogen mij vinden</b><small>Andere gebruikers kunnen je profiel vinden en een chat met je beginnen. Je e-mailadres en exacte locatie blijven privé.</small><small id="directoryOptInStatus" class="directory-switch-status" role="status" aria-live="polite">Verbinding controleren…</small></span><input id="directoryOptIn" type="checkbox" disabled aria-describedby="directoryOptInStatus">';
 parent.append(row);$('directoryOptIn').addEventListener('change',save);
}
async function load(){
 const seq=++revision,toggle=$('directoryOptIn');if(!toggle)return;
 toggle.disabled=true;
 if(window.__WD_PREVIEW__){toggle.checked=false;status('Proefversie is alleen-lezen. In de live-app kun je dit na inloggen aanzetten.',false);return}
 if(!verified()){
   serverProfile=null;
   toggle.indeterminate=false;
   toggle.checked=false;
   status(account()?.user?.is_anonymous?'Log eerst in met een geverifieerd account om vindbaar te worden.':'Meld je aan om vindbaar te worden.',false);
   return;
 }
 try{
   const {data,error}=await account().client.from('profiles').select('display_name,avatar,home_place,breed,discoverable').eq('id',account().user.id).maybeSingle();
   if(error)throw error;if(seq!==revision)return;
   serverProfile=data||null;
   toggle.indeterminate=false;
   toggle.checked=Boolean(data?.discoverable);toggle.disabled=false;
   status(toggle.checked?'Vindbaar: anderen kunnen je vinden en een gesprek beginnen.':'Niet vindbaar: alleen jij ziet je profiel.',true);
 }catch(err){if(seq!==revision)return;console.warn('Vindbaarheid ophalen mislukt',err);toggle.indeterminate=true;toggle.disabled=true;status('De opgeslagen stand is nu niet op te halen. Je vorige keuze is niet veranderd; open je profiel opnieuw om opnieuw te proberen.',false)}
}
async function save(event){
 const toggle=event.target,requested=toggle.checked,previous=!requested;
 toggle.disabled=true;
 if(window.__WD_PREVIEW__||!verified()){toggle.checked=previous;await load();return}
 const id=account().user.id;
 const local=profile();
 const p={
   name:serverProfile?.display_name||local?.name||'',
   avatar:serverProfile?.avatar||local?.avatar||'🐾',
   homePlace:serverProfile?.home_place||local?.homePlace||'',
   breed:serverProfile?.breed||local?.breed||''
 };
 if(!p.name.trim()){toggle.checked=previous;status('Vul eerst je profielnaam in bij Mijn profiel en sla het profiel op.',false);toggle.disabled=false;return}
 busy=true;const seq=++revision;
 try{
   const {data,error}=await account().client.rpc('set_profile_discoverability',{
     enabled:requested,profile_name:String(p.name).trim().slice(0,40),
     profile_avatar:String(p.avatar||'🐾').slice(0,16),
     profile_place:String(p.homePlace||'').slice(0,80),
     pet_breed:String(p.breed||'').slice(0,80)
   });
   if(error)throw error;
   if(account()?.user?.id!==id)throw new Error('Account changed while saving visibility');
   if(data!==requested)throw new Error('The server did not acknowledge the requested visibility');
   if(seq!==revision)return;
   // The RPC has already committed the change. Never roll back the checkbox
   // merely because a *second*, read-only verification request fails.
   serverProfile={...(serverProfile||{}),display_name:p.name,avatar:p.avatar,home_place:p.homePlace,breed:p.breed,discoverable:requested};
   toggle.checked=requested;
   status(requested?'Je profiel is vindbaar. Opgeslagen.':'Je profiel is niet vindbaar. Opgeslagen.',true);
   document.dispatchEvent(new CustomEvent('wd:directory-updated'));
   try{
     const {data:check,error:readError}=await account().client.from('profiles').select('display_name,avatar,home_place,breed,discoverable').eq('id',id).maybeSingle();
     if(readError)throw readError;
     if(seq!==revision||account()?.user?.id!==id)return;
     if(check){
       serverProfile=check;
       toggle.checked=Boolean(check.discoverable);
       status(toggle.checked?'Je profiel is vindbaar. Opgeslagen.':'Je profiel is niet vindbaar. Opgeslagen.',true);
     }
   }catch(verificationError){
     console.warn('Vindbaarheid is opgeslagen; extra controle tijdelijk niet beschikbaar',verificationError);
     if(seq===revision)status('Je keuze is opgeslagen. De extra controle lukte niet; open je profiel opnieuw om de stand op te halen.',true);
   }
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
 document.addEventListener('wd:profile-updated',()=>{if(!busy)load()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

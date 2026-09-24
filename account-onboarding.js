(()=>{
'use strict';
const $=id=>document.getElementById(id);
const panel=$('wdAccount');if(!panel)return;
const preview=Boolean(window.__WD_PREVIEW__);
const client=()=>window.WhatsupDogCommunity?.client;
const user=()=>window.WhatsupDogCommunity?.user;
const verified=()=>Boolean(user()?.id&&!user().is_anonymous);
const redirect=()=>location.origin+location.pathname;
const status=(id,message)=>{if($(id))$(id).textContent=message};
let busy=false,lastMail=0,profileOwner=null,authListener=false;
const signup=document.createElement('form');signup.id='wdAccountCreate';signup.className='wd-account-create';signup.hidden=true;
signup.innerHTML=`
<h3>Maak je gratis buurtaccount</h3>
<p>Je e-mailadres blijft privé. Kies een wachtwoord of ontvang een eenmalige accountlink.</p>
<label for="wdSignupEmail">E-mailadres</label>
<input id="wdSignupEmail" type="email" autocomplete="email" inputmode="email" maxlength="254" required placeholder="naam@voorbeeld.nl">
<label for="wdSignupPassword">Wachtwoord (minimaal 12 tekens)</label>
<input id="wdSignupPassword" type="password" autocomplete="new-password" minlength="12" maxlength="256" placeholder="Minimaal 12 tekens">
<label for="wdSignupRepeat">Herhaal wachtwoord</label>
<input id="wdSignupRepeat" type="password" autocomplete="new-password" minlength="12" maxlength="256" placeholder="Herhaal je wachtwoord">
<div class="wd-account-actions"><button class="primary" id="wdSignupSubmit" type="submit">Account aanmaken</button><button class="outline-btn" id="wdSignupLink" type="button">Aanmelden zonder wachtwoord</button></div>
<button class="wd-account-quiet" id="wdSignupCancel" type="button">Terug naar inloggen</button>
<p id="wdSignupStatus" role="status" aria-live="polite"></p>`;
const profile=document.createElement('form');profile.id='wdAccountProfile';profile.className='wd-account-profile';profile.hidden=true;
profile.innerHTML=`
<h3 id="wdAccountProfileTitle">Maak je profiel af</h3>
<p>Je profiel is van jou. Anderen zien je pas in de zoeklijst wanneer je zelf ‘Anderen mogen mij vinden’ aanzet.</p>
<label for="wdMemberName">Profielnaam</label>
<input id="wdMemberName" autocomplete="nickname" maxlength="40" required placeholder="Bijv. Bowie of Sophie">
<label for="wdMemberPlace">Woonplaats (geen adres)</label>
<input id="wdMemberPlace" autocomplete="address-level2" maxlength="80" required placeholder="Bijv. Nijkerk">
<label for="wdMemberSpecies">Ik gebruik Whatsup Dog voor</label>
<select id="wdMemberSpecies"><option value="dog">Hond</option><option value="cat">Kat</option><option value="both">Hond en kat</option></select>
<label for="wdMemberBreed">Ras (optioneel)</label>
<input id="wdMemberBreed" maxlength="80" placeholder="Bijv. Friese stabij, kruising of onbekend">
<label for="wdMemberAvatar">Avatar</label>
<select id="wdMemberAvatar"><option value="🐶">🐶 Hond</option><option value="🐕">🐕 Hond</option><option value="🐈">🐈 Kat</option><option value="🐱">🐱 Kat</option><option value="🐾">🐾 Pootjes</option><option value="◆">◆ Hond en kat</option></select>
<button id="wdMemberSave" type="submit" class="primary">Profiel veilig opslaan</button>
<p id="wdMemberStatus" role="status" aria-live="polite"></p>`;
const recovery=document.createElement('form');recovery.id='wdPasswordRecovery';recovery.className='wd-account-create';recovery.hidden=true;
recovery.innerHTML=`<h3>Nieuw wachtwoord instellen</h3><label for="wdRecoveryPassword">Nieuw wachtwoord (minimaal 12 tekens)</label><input id="wdRecoveryPassword" type="password" minlength="12" maxlength="256" autocomplete="new-password" required><label for="wdRecoveryRepeat">Herhaal wachtwoord</label><input id="wdRecoveryRepeat" type="password" minlength="12" maxlength="256" autocomplete="new-password" required><button class="primary" type="submit">Wachtwoord opslaan</button><p id="wdRecoveryStatus" role="status" aria-live="polite"></p>`;
const forgot=document.createElement('button');forgot.id='wdAccountForgot';forgot.type='button';forgot.className='wd-account-quiet';forgot.textContent='Wachtwoord vergeten?';
$('wdAccountLogin')?.append(forgot);
panel.append(signup,profile,recovery);
let demoMode='none';
if(preview){
 const demo=document.createElement('div');demo.id='wdAccountDemo';demo.className='wd-account-demo';
 demo.innerHTML='<h3>Bekijk hoe je straks een account maakt</h3><p>Dit zijn voorbeelden. Je kunt hier geen echte gegevens invullen of versturen.</p><div class="wd-account-actions"><button type="button" id="wdDemoSignup" class="outline-btn">Accountgegevens</button><button type="button" id="wdDemoProfile" class="outline-btn">Hond- of kattenprofiel</button></div>';
 panel.append(demo);
 for(const form of [signup,profile])form.querySelectorAll('input,select,button').forEach(field=>{field.disabled=true;field.autocomplete='off'});
 $('wdDemoSignup').addEventListener('click',()=>{demoMode=demoMode==='signup'?'none':'signup';signup.hidden=demoMode!=='signup';profile.hidden=true});
 $('wdDemoProfile').addEventListener('click',()=>{demoMode=demoMode==='profile'?'none':'profile';profile.hidden=demoMode!=='profile';signup.hidden=true});
}
const registerButton=$('wdAccountRegister');
function showCreate(){if(preview)return;signup.hidden=false;const initial=$('wdAccountEmail')?.value.trim();if(initial)$('wdSignupEmail').value=initial;signup.scrollIntoView({block:'nearest'});$('wdSignupEmail').focus({preventScroll:true})}
registerButton?.addEventListener('click',()=>setTimeout(showCreate,0));
$('wdSignupCancel').addEventListener('click',()=>{signup.hidden=true;$('wdAccountEmail')?.focus({preventScroll:true})});
function cooldown(target='wdSignupStatus'){if(Date.now()-lastMail<60000){status(target,'Er is al een e-mail aangevraagd. Kijk eerst in je mailbox en wacht één minuut.');return true}return false}
function setBusy(value){busy=value;for(const id of ['wdSignupSubmit','wdSignupLink','wdMemberSave']){if($(id))$(id).disabled=value||preview}}
function errorMessage(error){if(Number(error?.status)===429||/rate.?limit|too many/i.test(String(error?.message||''))){lastMail=Date.now();return 'Er zijn te veel e-mails aangevraagd. Wacht en kijk eerst in je mailbox.'}return 'Dit lukt nu niet. Controleer het e-mailadres en probeer het later opnieuw.'}
signup.addEventListener('submit',async event=>{
 event.preventDefault();if(preview||busy||!client()||!signup.reportValidity()||cooldown())return;
 const mail=$('wdSignupEmail').value.trim(),p=$('wdSignupPassword').value,repeat=$('wdSignupRepeat').value;
 if(p.length<12||p!==repeat){status('wdSignupStatus','Gebruik minimaal 12 tekens en voer tweemaal hetzelfde wachtwoord in.');return}
 setBusy(true);status('wdSignupStatus','Je account wordt aangemaakt…');
 try{
  const {data,error}=await client().auth.signUp({email:mail,password:p,options:{emailRedirectTo:redirect()}});
  if(error)throw error;lastMail=Date.now();
  status('wdSignupStatus',data?.session?'Je account is actief. Maak hieronder je profiel af.':'Controleer je mailbox en bevestig je e-mailadres. Open de link op hetzelfde apparaat; daarna kun je je profiel afmaken.');
  if(data?.session)await loadProfile(true);
 }catch(error){console.warn('Account maken mislukt',error);status('wdSignupStatus',errorMessage(error))}
 finally{$('wdSignupPassword').value='';$('wdSignupRepeat').value='';setBusy(false)}
});
$('wdSignupLink').addEventListener('click',async()=>{
 if(preview||busy||!client()||!$('wdSignupEmail').checkValidity()||cooldown()){if(!preview&&!$('wdSignupEmail').checkValidity())$('wdSignupEmail').reportValidity();return}
 setBusy(true);status('wdSignupStatus','Je accountlink wordt aangevraagd…');
 try{
  const {error}=await client().auth.signInWithOtp({email:$('wdSignupEmail').value.trim(),options:{shouldCreateUser:true,emailRedirectTo:redirect()}});
  if(error)throw error;lastMail=Date.now();status('wdSignupStatus','Controleer je e-mail. Open de accountlink op dit apparaat om je profiel af te maken.');
 }catch(error){console.warn('Accountlink aanvragen mislukt',error);status('wdSignupStatus',errorMessage(error))}
 finally{setBusy(false)}
});
forgot.addEventListener('click',async()=>{
 const mail=$('wdAccountEmail');if(preview||busy||!client())return;
 if(!mail?.checkValidity()){mail?.reportValidity();return}
 if(cooldown('wdAccountStatus'))return;
 setBusy(true);
 try{
  const {error}=await client().auth.resetPasswordForEmail(mail.value.trim(),{redirectTo:redirect()});
  if(error)throw error;lastMail=Date.now();status('wdAccountStatus','Als dit account bestaat, ontvang je een link om een nieuw wachtwoord te kiezen. Kijk ook in de spammap.');
 }catch(error){console.warn('Wachtwoordreset mislukt',error);status('wdAccountStatus',errorMessage(error))}
 finally{setBusy(false)}
});
recovery.addEventListener('submit',async event=>{
 event.preventDefault();if(preview||busy||!client()||!recovery.reportValidity())return;
 const a=$('wdRecoveryPassword'),b=$('wdRecoveryRepeat');
 if(a.value!==b.value){status('wdRecoveryStatus','De wachtwoorden komen niet overeen.');return}
 const password=a.value;a.value='';b.value='';setBusy(true);
 try{const {error}=await client().auth.updateUser({password});if(error)throw error;recovery.hidden=true;status('wdAccountStatus','Je nieuwe wachtwoord is opgeslagen.')}
 catch(error){console.warn('Wachtwoord opslaan mislukt',error);status('wdRecoveryStatus','Wachtwoord opslaan is mislukt. Vraag eventueel een nieuwe resetlink aan.')}
 finally{setBusy(false)}
});
const local=()=>{try{return JSON.parse(localStorage.getItem('wd_profile_v1')||'null')}catch{return null}};
function fill(row){
 const old=local(),p=row||old||{};
 $('wdMemberName').value=p.display_name||p.name||'';
 $('wdMemberPlace').value=p.home_place||p.homePlace||'';
 $('wdMemberBreed').value=p.breed||'';
 const species=user()?.user_metadata?.species_context||p.speciesContext||'dog';
 $('wdMemberSpecies').value=['dog','cat','both'].includes(species)?species:'dog';
 const avatar=p.avatar||'🐶';$('wdMemberAvatar').value=[...$('wdMemberAvatar').options].some(x=>x.value===avatar)?avatar:'🐾';
 $('wdAccountProfileTitle').textContent=row?'Mijn profiel aanpassen':'Maak je profiel af';
}
async function loadProfile(force=false){
 if(preview||!verified()||!client()){profile.hidden=true;profileOwner=null;return}
 if(!force&&profileOwner===user().id)return;
 const id=user().id;profileOwner=id;
 try{
  const {data,error}=await client().from('profiles').select('id,display_name,avatar,home_place,breed,discoverable').eq('id',id).maybeSingle();
  if(error)throw error;if(!verified()||user().id!==id)return;
  fill(data);profile.hidden=false;signup.hidden=true;
  status('wdMemberStatus',data?'Je kunt je profiel hier aanpassen.':'Vul je profiel in om te kunnen chatten en melden. Vindbaarheid blijft standaard uit.');
 }catch(error){profileOwner=null;profile.hidden=true;console.warn('Profiel ophalen mislukt',error);status('wdAccountStatus','Je account is ingelogd, maar je profiel kon niet worden opgehaald. Probeer opnieuw.')}
}
profile.addEventListener('submit',async event=>{
 event.preventDefault();if(preview||busy||!verified()||!client()||!profile.reportValidity())return;
 const id=user().id,display_name=$('wdMemberName').value.trim(),home_place=$('wdMemberPlace').value.trim();
 if(!display_name||!home_place){status('wdMemberStatus','Vul je profielnaam en woonplaats in.');return}
 const avatar=$('wdMemberAvatar').value,breed=$('wdMemberBreed').value.trim()||null,species_context=$('wdMemberSpecies').value;
 setBusy(true);status('wdMemberStatus','Profiel veilig opslaan…');
 try{
  const {error}=await client().from('profiles').upsert({id,display_name,avatar,home_place,breed,updated_at:new Date().toISOString()},{onConflict:'id'});
  if(error)throw error;
  const {error:metaError}=await client().auth.updateUser({data:{species_context}});
  if(metaError)throw metaError;
  if(user()?.id!==id)throw new Error('Account changed during profile save');
  const old=local(),unchangedTown=old?.homePlace===home_place;
  const next={name:display_name,avatar,homePlace:home_place,breed:breed||'',speciesContext:species_context,
   homeLat:unchangedTown?old?.homeLat:null,homeLng:unchangedTown?old?.homeLng:null,
   createdAt:old?.createdAt||new Date().toISOString()};
  localStorage.setItem('wd_profile_v1',JSON.stringify(next));
  if(typeof updateProfileUI==='function')updateProfileUI();
  document.dispatchEvent(new CustomEvent('wd:profile-updated',{detail:{profile:next}}));
  status('wdMemberStatus','Je profiel is opgeslagen. Je bepaalt zelf via ‘Anderen mogen mij vinden’ of je in de zoeklijst staat.');
  $('directoryOptInRow')?.scrollIntoView({block:'nearest'});
 }catch(error){console.warn('Profiel opslaan mislukt',error);status('wdMemberStatus','Opslaan is nog niet helemaal gelukt. Je gegevens blijven hier staan; probeer opnieuw.')}
 finally{setBusy(false)}
});
function refresh(){
 if(preview){signup.hidden=demoMode!=='signup';profile.hidden=demoMode!=='profile';recovery.hidden=true;forgot.hidden=true;return}
 if(verified()){loadProfile().catch(console.warn);signup.hidden=true}else{profile.hidden=true;profileOwner=null}
 if(client()&&!authListener&&typeof client().auth?.onAuthStateChange==='function'){
  authListener=true;client().auth.onAuthStateChange((event)=>{
   if(event==='PASSWORD_RECOVERY'){recovery.hidden=false;status('wdRecoveryStatus','Kies hieronder je nieuwe wachtwoord.');}
   if(event==='SIGNED_IN')setTimeout(()=>loadProfile(true).catch(console.warn),0);
  });
 }
}
document.addEventListener('wd:auth-changed',refresh);
document.addEventListener('wd:community-status',()=>{if(!authListener)refresh()});
refresh();
})();
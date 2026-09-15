(()=>{
  const PROFILE_KEY='wd_profile_v1';
  const VALID=new Set(['dog','cat','both']);
  const $=id=>document.getElementById(id);
  const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY))||{}}catch{return{}}};
  const context=()=>VALID.has(readProfile().speciesContext)?readProfile().speciesContext:'dog';
  const copy={
    dog:{animal:'hond',avatar:'🐶',hello:'Wat gaan jullie doen?',subtitle:'Veilig wandelen begint met weten wat er in de buurt speelt.',report:'Help honden en mensen in de buurt.'},
    cat:{animal:'kat',avatar:'🐈',hello:'Wat speelt er in de buurt?',subtitle:'Zie snel wat buiten voor jouw kat belangrijk is.',report:'Help katten en mensen in de buurt.'},
    both:{animal:'dieren',avatar:'◆',hello:'Wat speelt er rondom jullie?',subtitle:'Alle relevante signalen voor je dieren, rustig bij elkaar.',report:'Help dieren en mensen in de buurt.'}
  };

  function setText(selector,value){const node=document.querySelector(selector);if(node)node.textContent=value}
  function setHtml(selector,value){const node=document.querySelector(selector);if(node)node.innerHTML=value}
  function chooseReportAudience(mode){
    const value=mode==='both'?'both':mode;
    const input=document.querySelector(`input[name="reportSpecies"][value="${value}"]`);
    if(input)input.checked=true;
  }
  function renderOnboarding(mode){
    const selected=document.querySelector(`input[name="speciesContext"][value="${mode}"]`);if(selected)selected.checked=true;
    const intro=$('onboardingIntro');if(intro)intro.textContent=mode==='dog'?'Voor wandelen, losloopplekken en signalen rond je hond.':mode==='cat'?'Voor vermist, gevonden en gevaren rond je kat.':'Voor honden én katten, zonder dubbele drukte.';
    setHtml('#welcomePoints',mode==='dog'?'<li>Vind rustige wandel- en losloopplekken</li><li>Zie gevaren voordat je op pad gaat</li><li>Deel een melding met de buurt</li>':mode==='cat'?'<li>Zie gevaren en lokale signalen</li><li>Vind vermiste en gevonden katten sneller</li><li>Deel een melding met de buurt</li>':'<li>Bekijk relevante signalen voor beide</li><li>Geef per melding de diersoort aan</li><li>Houd één rustige buurtkaart</li>');
    const breed=$('breedField');if(breed)breed.hidden=mode!=='dog';
    const choices=mode==='cat'?['🐈','🐈‍⬛','😺','🐾']:mode==='both'?['◆','🐾','♡','⌂']:['🐶','🐕','🦮','🐩','🐕‍🦺','🐾'];
    const grid=$('avatarGrid');if(grid){grid.innerHTML=choices.map((a,i)=>`<button type="button" class="avatar-choice ${i===0?'selected':''}" data-avatar="${a}" aria-label="Avatar ${i+1}">${a}</button>`).join('');if(typeof selectedAvatar!=='undefined')selectedAvatar=choices[0];}
    const label=document.querySelector('#onboardingName')?.closest('label')?.querySelector(':scope > span');if(label)label.textContent=mode==='dog'?'Naam van jezelf of je hond':mode==='cat'?'Naam van jezelf of je kat':'Naam van jezelf of je dieren';
    const homeLabel=document.querySelector('#onboardingHome')?.closest('label')?.querySelector(':scope > span');if(homeLabel)homeLabel.textContent='Waar wonen jullie?';
  }
  function renderApp(mode){
    const c=copy[mode];document.documentElement.dataset.species=mode;
    document.body.classList.remove('mode-dog','mode-cat','mode-both');document.body.classList.add(`mode-${mode}`);
    const profile=readProfile();
    setText('#homeTitle',c.hello);setText('#homeSubtitle',profile.homePlace?`${c.subtitle} Rond ${profile.homePlace}.`:c.subtitle);setText('#reportAudienceCopy',c.report);
    if(!profile.name){['homeAvatar','profileQuickAvatar','navProfileAvatar','profileAvatarBig'].forEach(id=>setText(`#${id}`,c.avatar));}
    setText('#profileSubtitle',profile.homePlace?`Woont in ${profile.homePlace} · buurtcontext ${mode==='dog'?'hond':mode==='cat'?'kat':'beide'}`:`Maak je ${mode==='both'?'dierenprofiel':c.animal+'enprofiel'} af`);
    const title=$('profileName');if(title&&!profile.name)title.textContent=mode==='both'?'Jouw dieren':`Jouw ${c.animal}`;
    const breed=$('profileBreed');if(breed)breed.hidden=mode!=='dog';
    const offleashSection=$('homeAreas')?.closest('.home-section');if(offleashSection)offleashSection.hidden=mode==='cat';
    const offleashAction=$('homeOffleash');if(offleashAction){offleashAction.hidden=mode==='cat';if(mode==='both')offleashAction.innerHTML='<span>◇</span><b>Voor hond</b><small>Losloopplekken</small>';}
    const walk=$('homeWalk');if(walk)walk.innerHTML=mode==='dog'?'<span>⌖</span><b>Wandelen</b><small>Open de kaart</small>':mode==='cat'?'<span>⌖</span><b>Bekijk buurt</b><small>Open de kaart</small>':'<span>⌖</span><b>Bekijk buurt</b><small>Alle signalen</small>';
    const mapLayer=document.querySelector('.map-bottom-card .layer-row');if(mapLayer)mapLayer.hidden=mode==='cat';
    const offleashChip=document.querySelector('[data-filter="offleash"]');if(offleashChip)offleashChip.hidden=mode==='cat';
    document.querySelectorAll('[data-report-type="walk"],[data-report-type="spotted"]').forEach(node=>node.hidden=mode==='cat');
    document.querySelectorAll('[data-lost-kind]').forEach(node=>{if(mode==='cat')node.textContent=node.dataset.lostKind==='missing'?'Vermiste kat':'Gevonden kat';else if(mode==='both')node.textContent=node.dataset.lostKind==='missing'?'Vermist dier':'Gevonden dier';else node.textContent=node.dataset.lostKind==='missing'?'Vermiste hond':'Gevonden hond'});
    if(mode==='cat'&&window.map&&window.offleashLayer&&map.hasLayer(offleashLayer))map.removeLayer(offleashLayer);
    const privacy=document.querySelector('#view-profile .privacy-card p');if(privacy)privacy.textContent='Andere gebruikers zien alleen je openbare dierenprofiel, nooit automatisch je e-mailadres of live locatie.';
    chooseReportAudience(mode);renderOnboarding(mode);
  }
  function setDraft(mode){if(!VALID.has(mode))return;renderOnboarding(mode);chooseReportAudience(mode)}
  function boot(){
    renderApp(context());
    $('speciesPicker')?.addEventListener('change',e=>{setDraft(e.target.value);setTimeout(()=>setDraft(e.target.value),30)});
    $('editProfile')?.addEventListener('click',()=>setTimeout(()=>renderOnboarding(context()),0));
    $('onboardingDialog')?.addEventListener('close',()=>setTimeout(()=>renderApp(context()),20));
    $('reportFab')?.addEventListener('click',()=>setTimeout(()=>chooseReportAudience(context()),0));
    document.addEventListener('wd:profile-updated',e=>renderApp(VALID.has(e.detail?.profile?.speciesContext)?e.detail.profile.speciesContext:context()));
    window.addEventListener('storage',e=>{if(e.key===PROFILE_KEY)renderApp(context())});
  }
  window.WhatsupDogSpecies=Object.freeze({get:context,render:renderApp});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

(()=>{
  const PROFILE_KEY='wd_profile_v1';
  let client=null,user=null,activeRemote=null,channel=null;
  const $=id=>document.getElementById(id);
  const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function injectStyles(){
    if($('wd-directory-style'))return;
    const s=document.createElement('style');s.id='wd-directory-style';s.textContent=`
      .directory-card{margin:14px 0;background:#fff;border:1px solid rgba(59,36,24,.12);border-radius:20px;padding:14px}
      .directory-card h3{margin:0 0 4px}.directory-card>p{margin:0 0 12px;color:#71655c;font-size:12px;line-height:1.45}
      .directory-list{display:grid;gap:9px}.directory-person{width:100%;border:1px solid rgba(59,36,24,.12);border-radius:16px;background:#fbf8f1;padding:10px 12px;display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;text-align:left;color:#3b2418}
      .directory-person .avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;font-size:24px}.directory-person b{display:block}.directory-person small{display:block;color:#71655c;margin-top:2px}.directory-person .go{font-size:20px}
      .directory-empty{padding:14px;border-radius:14px;background:#f5efe3;color:#71655c;font-size:12px;line-height:1.45}
      .directory-switch{margin-top:12px}.directory-switch small{max-width:290px}.directory-switch.is-unavailable>span>small:not(.directory-switch-status){color:#71655c}.directory-switch-status{display:block;margin-top:6px;color:#8b302b!important;font-weight:800}.directory-switch-status.is-ready{color:#397844!important}
      .remote-chat-note{font-size:11px;color:#71655c;margin:4px 0 0}.remote-message-mine{margin-left:auto;background:#eaf4df!important}.remote-message-other{margin-right:auto}
      @media(max-width:560px){.directory-person{grid-template-columns:42px 1fr auto}.directory-card{margin-left:0;margin-right:0}}
    `;document.head.appendChild(s);
  }

  async function waitForBackend(){
    for(let i=0;i<40;i++){
      const api=window.WhatsupDogCommunity;
      if(api?.client&&api?.user){client=api.client;user=api.user;return true}
      if(api&&(api.configured===false||api.status==='error'))return false;
      await new Promise(r=>setTimeout(r,250));
    }
    return false;
  }

  function injectProfileOptIn(){
    const settings=document.querySelector('#view-profile .settings-card.compact');if(!settings||$('directoryOptInRow'))return;
    const row=document.createElement('label');row.id='directoryOptInRow';row.className='switch-row directory-switch';row.innerHTML='<span><b>👋 Vindbaar in Whatsup dog</b><small>Opt-in: toon alleen profielnaam, avatar, diersoortinformatie en woonplaats aan andere gebruikers. Nooit e-mail of exacte locatie.</small><small id="directoryOptInStatus" class="directory-switch-status" role="status" aria-live="polite">Verbinding controleren…</small></span><input id="directoryOptIn" type="checkbox" disabled aria-describedby="directoryOptInStatus">';
    settings.appendChild(row);
    $('directoryOptIn').addEventListener('change',saveOptIn);
  }

  function setOptInAvailability(available,message){
    const box=$('directoryOptIn'),row=$('directoryOptInRow'),status=$('directoryOptInStatus');
    if(box)box.disabled=!available;if(row)row.classList.toggle('is-unavailable',!available);
    if(status){status.textContent=message;status.classList.toggle('is-ready',available)}
  }

  async function loadOwnOptIn(){
    if(!client||!user)return;
    const {data,error}=await client.from('profiles').select('discoverable,breed').eq('id',user.id).maybeSingle();
    if(error){console.warn('Vindbaarheid kon niet worden gelezen',error);setOptInAvailability(false,'Deze functie is tijdelijk niet beschikbaar. Probeer het later opnieuw.');return false}
    const box=$('directoryOptIn');if(box)box.checked=Boolean(data?.discoverable);
    setOptInAvailability(true,data?.discoverable?'Je profiel is vindbaar.':'Uit: je profiel is niet zichtbaar voor anderen.');return true
  }

  async function saveOptIn(e){
    const enabled=Boolean(e.target.checked),p=readProfile();
    e.target.disabled=true;
    try{
      if(!client||!user)throw new Error('Communityverbinding nog niet klaar');
      const {error}=await client.from('profiles').update({discoverable:enabled,breed:String(p?.breed||'').slice(0,80)||null,updated_at:new Date().toISOString()}).eq('id',user.id);
      if(error)throw error;
    }catch(err){console.warn(err);e.target.checked=!enabled;setOptInAvailability(true,'Opslaan lukte niet. Controleer je verbinding en probeer opnieuw.');window.toast?.('Vindbaarheid kon niet worden opgeslagen');return}
    finally{e.target.disabled=false}
    window.toast?.(enabled?'👋 Je bent nu vindbaar in Whatsup dog':'Je bent niet meer vindbaar voor andere gebruikers');
    setOptInAvailability(true,enabled?'Je profiel is vindbaar.':'Uit: je profiel is niet zichtbaar voor anderen.');
    try{await refreshDirectory()}catch(err){console.warn('Directory kon na opslaan niet worden ververst',err)}
  }

  function directoryContext(){
    if(document.body.classList.contains('mode-cat'))return{title:'Kattenmensen',fallback:'Kattenbezitter',avatar:'🐈',placeholder:'Schrijf een bericht…'};
    if(document.body.classList.contains('mode-both'))return{title:'Mensen met huisdieren',fallback:'Huisdierbezitter',avatar:'🐾',placeholder:'Schrijf een bericht…'};
    return{title:'Hondenmensen',fallback:'Hondenbezitter',avatar:'🐶',placeholder:'Zeg iets hondigs…'};
  }

  function injectDirectory(){
    const chat=$('view-chat');if(!chat||$('peopleDirectory'))return;
    const context=directoryContext(),card=document.createElement('section');card.id='peopleDirectory';card.className='directory-card';card.innerHTML=`<h3>🐾 ${context.title}</h3><p>Alleen mensen die zelf <b>Vindbaar in Whatsup dog</b> hebben aangezet staan hier.</p><div id="directoryList" class="directory-list"><div class="directory-empty">Laden…</div></div>`;
    $('chatDirectoryNote')?.remove();
    const list=$('chatList');list?.insertAdjacentElement('beforebegin',card);
    card.addEventListener('click',e=>{const b=e.target.closest('[data-directory-user]');if(b)startPrivateChat(b.dataset.directoryUser,b.dataset.name,b.dataset.avatar)});
  }

  async function refreshDirectory(){
    const list=$('directoryList');if(!list||!client)return;
    const {data,error}=await client.rpc('list_discoverable_profiles');
    if(error){console.warn('Directory kon niet laden',error);list.innerHTML='<div class="directory-empty">De gebruikerslijst is nu niet beschikbaar.</div>';return}
    const rows=Array.isArray(data)?data:[];
    if(!rows.length){list.innerHTML='<div class="directory-empty">Nog niemand anders heeft zich vindbaar gemaakt. Zodra iemand de opt-in aanzet, verschijnt die hier.</div>';return}
    const context=directoryContext();
    list.innerHTML=rows.map(p=>`<button type="button" class="directory-person" data-directory-user="${esc(p.id)}" data-name="${esc(p.display_name)}" data-avatar="${esc(p.avatar||context.avatar)}"><span class="avatar">${esc(p.avatar||context.avatar)}</span><span><b>${esc(p.display_name||context.fallback)}</b><small>${esc([p.breed,p.home_place].filter(Boolean).join(' · ')||'Whatsup dog')}</small></span><span class="go">›</span></button>`).join('');
  }

  async function startPrivateChat(targetId,name,avatar){
    if(!client)return;
    try{
      const {data:room,error}=await client.rpc('start_private_chat',{target:targetId});if(error)throw error;
      const context=directoryContext();activeRemote={roomId:room,name:name||context.fallback,avatar:avatar||context.avatar};
      $('peopleDirectory')?.classList.add('hidden');$('chatList')?.classList.add('hidden');
      await renderRemoteChat();subscribeRoom();
    }catch(err){console.warn(err);window.toast?.('Privégesprek kon niet worden gestart')}
  }

  async function renderRemoteChat(){
    if(!activeRemote||!client)return;
    const {data,error}=await client.from('chat_messages').select('id,user_id,body,created_at').eq('room_id',activeRemote.roomId).order('created_at',{ascending:true}).limit(200);
    if(error){console.warn(error);return}
    const box=$('chatConversation');if(!box)return;
    box.classList.remove('hidden');$('chatInput').placeholder=`Bericht aan ${activeRemote.name}…`;
    const messages=(data||[]).map(m=>`<div class="message-bubble ${m.user_id===user.id?'remote-message-mine':'remote-message-other'}">${esc(m.body)}<small>${new Date(m.created_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join('');
    box.innerHTML=`<div class="conversation-head"><button type="button" class="conversation-back" aria-label="Terug naar mensen">‹</button><div class="chat-avatar">${esc(activeRemote.avatar)}</div><div><b>${esc(activeRemote.name)}</b><small>Privégesprek · Whatsup dog</small></div></div><p class="remote-chat-note">Alleen deelnemers aan dit gesprek kunnen deze berichten lezen.</p><div class="conversation-messages">${messages||'<p class="chat-empty">Nog geen berichten. Zeg hallo 🐾</p>'}</div>`;
    box.querySelector('.conversation-back').onclick=closeRemoteChat;
    requestAnimationFrame(()=>{const m=box.querySelector('.conversation-messages');if(m)m.scrollTop=m.scrollHeight});
  }

  function subscribeRoom(){
    if(channel){client.removeChannel(channel);channel=null}
    if(!activeRemote)return;
    channel=client.channel('wd-private-'+activeRemote.roomId).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`room_id=eq.${activeRemote.roomId}`},()=>renderRemoteChat()).subscribe();
  }

  function closeRemoteChat(){
    if(channel&&client){client.removeChannel(channel);channel=null}
    activeRemote=null;$('chatConversation')?.classList.add('hidden');$('chatList')?.classList.remove('hidden');$('peopleDirectory')?.classList.remove('hidden');if($('chatInput'))$('chatInput').placeholder=directoryContext().placeholder;
  }

  function interceptChatSubmit(){
    $('chatForm')?.addEventListener('submit',async e=>{
      if(!activeRemote)return;
      e.preventDefault();e.stopImmediatePropagation();
      const input=$('chatInput'),body=input?.value.trim();if(!body)return;
      input.disabled=true;
      try{const {error}=await client.from('chat_messages').insert({room_id:activeRemote.roomId,user_id:user.id,body:body.slice(0,2000)});if(error)throw error;input.value='';await renderRemoteChat()}
      catch(err){console.warn(err);window.toast?.('Bericht kon niet worden verstuurd')}
      finally{input.disabled=false;input.focus()}
    },true);
  }

  async function boot(){
    injectStyles();injectProfileOptIn();injectDirectory();interceptChatSubmit();
    if(!await waitForBackend()){setOptInAvailability(false,'Tijdelijk niet beschikbaar: geen communityverbinding.');$('directoryList').innerHTML='<div class="directory-empty">Communityverbinding is niet beschikbaar.</div>';return}
    await loadOwnOptIn();await refreshDirectory();
    document.getElementById('onboardingDialog')?.addEventListener('close',async()=>{const p=readProfile();if(client&&user){await client.from('profiles').update({breed:String(p?.breed||'').slice(0,80)||null}).eq('id',user.id);await refreshDirectory()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,120),{once:true});else setTimeout(boot,120);
})();

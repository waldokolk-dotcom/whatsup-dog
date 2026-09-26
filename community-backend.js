(()=>{
  const CFG=window.WHATSUP_DOG_BACKEND||{};
  const REPORTS_KEY='wd_reports_v1';
  const PROFILE_KEY='wd_profile_v1';
  const QUEUE_KEY='wd_shared_report_queue_v1';
  const HIDDEN_KEY='wd_hidden_reports_v1';
  const SUPABASE_JS='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const state={client:null,user:null,channel:null,ready:false,refreshTimer:null,monitor:null,knownIds:new Set(),processing:false};

  const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const reports=()=>parse(REPORTS_KEY,[]);
  const profile=()=>parse(PROFILE_KEY,null);
  const queue=()=>parse(QUEUE_KEY,[]);
  const hidden=()=>new Set(parse(HIDDEN_KEY,[]));
  function publicKeyValid(key){
    if(typeof key!=='string')return false;
    if(key.startsWith('sb_publishable_'))return key.length>20;
    try{return JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon'}catch{return false}
  }
  const configured=()=>CFG.enabled===true&&/^https:\/\//.test(CFG.url||'')&&publicKeyValid(CFG.publishableKey);

  function setStatus(label,title){
    const status=document.getElementById('profileStatus');if(status){status.textContent=label;status.title=title||label}
    document.documentElement.dataset.community=label.toLowerCase().replace(/\s+/g,'-');
    document.dispatchEvent(new CustomEvent('wd:community-status',{detail:{label,title}}));
  }

  function loadScript(src,test){
    if(test())return Promise.resolve();
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>test()?resolve():reject(new Error('supabase-global-missing'));s.onerror=()=>reject(new Error('supabase-load-failed'));document.head.appendChild(s)});
  }

  function addQueue(id){const q=queue();if(!q.includes(id)){q.push(id);write(QUEUE_KEY,q)}}
  function removeQueue(id){write(QUEUE_KEY,queue().filter(x=>x!==id))}
  function markRemote(id,userId){const rows=reports(),i=rows.findIndex(r=>r.id===id);if(i<0)return;rows[i]={...rows[i],_remote:true,userId:userId||rows[i].userId||null};write(REPORTS_KEY,rows)}

  function redraw(){
    try{if(typeof drawReports==='function')drawReports()}catch{}
    try{if(typeof window.refreshWhatsupHome==='function')window.refreshWhatsupHome()}catch{}
    document.dispatchEvent(new CustomEvent('wd:shared-reports-updated'));
  }

  async function ensureUser(){
    const {data:sessionData,error:sessionError}=await state.client.auth.getSession();
    if(sessionError)throw sessionError;
    let session=sessionData?.session||null;
    if(!session){
      const p=profile();
      const {data,error}=await state.client.auth.signInAnonymously({options:{data:{display_name:p?.name||'Hondenbezitter',avatar:p?.avatar||'🐶'}}});
      if(error)throw error;session=data?.session||null;
    }
    state.user=session?.user||null;
    if(!state.user)throw new Error('anonymous-auth-no-user');
    return state.user;
  }

  async function syncProfile(){
    if(window.__WD_PREVIEW__||!state.user)return;
    const p=profile();if(!p?.name)return;
    const row={id:state.user.id,display_name:String(p.name).slice(0,40),avatar:String(p.avatar||'🐶').slice(0,16),home_place:String(p.homePlace||'').slice(0,80)||null,home_lat:Number.isFinite(Number(p.homeLat))?Number(p.homeLat):null,home_lng:Number.isFinite(Number(p.homeLng))?Number(p.homeLng):null,updated_at:new Date().toISOString()};
    const {error}=await state.client.from('profiles').upsert(row,{onConflict:'id'});if(error)throw error;
  }

  async function dataUrlToBlob(dataUrl){const response=await fetch(dataUrl);if(!response.ok)throw new Error('photo-blob-failed');return response.blob()}
  async function uploadPhoto(report){
    if(!report.photoDataUrl?.startsWith('data:image/'))return report.photoPath||null;
    const path=`${state.user.id}/${report.id}.jpg`;
    const blob=await dataUrlToBlob(report.photoDataUrl);
    const {error}=await state.client.storage.from(CFG.photoBucket||'report-photos').upload(path,blob,{contentType:'image/jpeg',upsert:false,cacheControl:'3600'});
    if(error){
      // A retry may find the immutable photo from an earlier successful upload.
      const {data,error:lookupError}=await state.client.storage.from(CFG.photoBucket||'report-photos').list(state.user.id,{search:report.id+'.jpg'});
      if(lookupError||!data?.some(file=>file.name===report.id+'.jpg'))throw error;
    }return path;
  }

  function cleanPolygon(value){
    if(!Array.isArray(value))return null;
    const pts=value.map(p=>Array.isArray(p)&&p.length>=2?[Number(p[0]),Number(p[1])]:null).filter(p=>p&&Number.isFinite(p[0])&&Number.isFinite(p[1]));
    return pts.length>=3?pts.slice(0,120):null;
  }

  async function shareOne(report){
    if(!state.ready||!state.user)return;
    if(report?._remote){removeQueue(report.id);return;}
    const ownerId=state.user.id;
    if(report._accountOwner&&report._accountOwner!==ownerId)throw new Error('report-belongs-to-another-account');
    if(!state.user.is_anonymous&&report._accountOwner!==ownerId)throw new Error('verified-report-requires-explicit-owner');
    const photoPath=await uploadPhoto(report);
    if(state.user?.id!==ownerId)throw new Error('account-changed-during-upload');
    const p=profile();const polygon=cleanPolygon(report.polygon);
    const row={
      id:report.id,user_id:state.user.id,author_name:String(p?.name||report.author||'Hondenbezitter').slice(0,40),author_avatar:String(p?.avatar||'🐶').slice(0,16),
      species:['dog','cat','both'].includes(report.species)?report.species:((['dog','cat','both'].includes(p?.speciesContext)?p.speciesContext:'dog')),
      type:String(report.type||'danger').slice(0,32),subtype:report.subtype?String(report.subtype).slice(0,80):null,text:String(report.text||'').slice(0,220),
      lat:Number(report.lat),lng:Number(report.lng),geometry_type:polygon?'polygon':'point',polygon:polygon,
      photo_path:photoPath,ai_suggestion:report.aiSuggestion&&typeof report.aiSuggestion==='object'?report.aiSuggestion:null
    };
    if(!Number.isFinite(row.lat)||!Number.isFinite(row.lng))throw new Error('invalid-report-location');
    const {error}=await state.client.from('reports').insert(row);
    if(error){
      if(error.code!=='23505')throw error;
      const {data:existing,error:readError}=await state.client.from('reports').select('user_id').eq('id',row.id).single();
      if(readError||existing?.user_id!==state.user.id)throw error;
    }
    markRemote(report.id,state.user.id);removeQueue(report.id);
    if(typeof toast==='function')toast('🐾 Melding gedeeld met andere hondenbezitters');
  }

  async function processQueue(){
    if(window.__WD_PREVIEW__||!state.ready||state.processing||!navigator.onLine||!state.user)return;state.processing=true;
    try{
      for(const id of queue()){
        const report=reports().find(r=>r.id===id);if(!report||report._shareIntent!==true){removeQueue(id);continue}
        if(report._accountOwner&&report._accountOwner!==state.user.id)continue;
        if(!state.user.is_anonymous&&report._accountOwner!==state.user.id)continue;
        try{await shareOne(report)}catch(err){console.warn('Whatsup dog delen uitgesteld',err);setStatus('Wacht op sync','Melding staat lokaal veilig en wordt later opnieuw gedeeld');break}
      }
    }finally{state.processing=false}
  }

  function relativeTime(iso){
    const ms=Date.now()-new Date(iso).getTime();if(!Number.isFinite(ms)||ms<0)return 'Zojuist';const m=Math.floor(ms/60000);if(m<1)return 'Zojuist';if(m<60)return `${m} min`;const h=Math.floor(m/60);if(h<24)return `${h} uur`;const d=Math.floor(h/24);return d===1?'Gisteren':`${d} dagen`;
  }

  async function signedPhoto(path){
    if(!path)return null;const {data,error}=await state.client.storage.from(CFG.photoBucket||'report-photos').createSignedUrl(path,Number(CFG.signedPhotoSeconds)||3600);if(error){console.warn('Foto-url kon niet worden gemaakt',error);return null}return data?.signedUrl||null;
  }

  async function refreshSharedReports(){
    if(!state.ready)return;
    const {data,error}=await state.client.from('reports').select('id,user_id,author_name,author_avatar,species,type,subtype,text,lat,lng,geometry_type,polygon,photo_path,ai_suggestion,confirmed_count,created_at').eq('status','active').order('created_at',{ascending:false}).limit(Number(CFG.maxSharedReports)||200);
    if(error)throw error;
    const remote=[];
    const hiddenIds=hidden();
    for(const row of data||[]){
      if(hiddenIds.has(row.id))continue;
      const photoUrl=await signedPhoto(row.photo_path);
      remote.push({id:row.id,species:row.species||'dog',type:row.type,subtype:row.subtype,text:row.text,lat:Number(row.lat),lng:Number(row.lng),time:relativeTime(row.created_at),author:row.author_name||'Hondenbezitter',authorAvatar:row.author_avatar||'🐶',confirmed:Number(row.confirmed_count||0),geometryType:row.geometry_type||'point',polygon:Array.isArray(row.polygon)?row.polygon:null,photoDataUrl:photoUrl,photoPath:row.photo_path||null,aiSuggestion:row.ai_suggestion||null,_remote:true,userId:row.user_id,createdAt:row.created_at});
    }
    const remoteIds=new Set(remote.map(r=>r.id));
    const local=reports().filter(r=>!r._remote&&!remoteIds.has(r.id));
    write(REPORTS_KEY,[...local,...remote]);
    for(const r of remote)state.knownIds.add(r.id);
    redraw();setStatus('Community aan','Gedeelde meldingen worden live bijgewerkt');
  }

  function scheduleRefresh(delay=350){clearTimeout(state.refreshTimer);state.refreshTimer=setTimeout(()=>refreshSharedReports().catch(err=>{console.warn('Community refresh mislukt',err);setStatus('Offline','Gedeelde meldingen konden niet worden bijgewerkt')}),delay)}

  function subscribe(){
    state.channel=state.client.channel('whatsup-dog-reports').on('postgres_changes',{event:'*',schema:'public',table:'reports'},()=>scheduleRefresh()).subscribe();
  }

  function watchLocalReports(){
    state.knownIds=new Set(reports().map(r=>r.id));
    // Never enqueue legacy local-only or demonstration reports on app startup.
    state.monitor=setInterval(()=>{
      const rows=reports();let tagged=false,shouldProcess=false;
      for(const r of rows){
        if(!r?.id||state.knownIds.has(r.id))continue;
        state.knownIds.add(r.id);
        if(!r._remote&&r._shareIntent===true){
          if(state.user?.id){r._accountOwner=state.user.id;tagged=true}
          addQueue(r.id);shouldProcess=true;
        }
      }
      if(tagged)write(REPORTS_KEY,rows);
      if(shouldProcess)processQueue();
    },700);
    window.addEventListener('online',()=>{setStatus('Synchroniseren','Internet teruggevonden');processQueue();scheduleRefresh(0)});
    document.getElementById('onboardingDialog')?.addEventListener('close',()=>syncProfile().catch(console.warn));
  }

  let authTransition=Promise.resolve();
  function observeAuthentication(){
    state.client.auth.onAuthStateChange((event,session)=>{
      if(event!=='SIGNED_IN'&&event!=='SIGNED_OUT')return;
      // Supabase recommends deferring additional Supabase API calls beyond the synchronous auth callback.
      authTransition=authTransition.then(async()=>{
        const nextUser=session?.user||null;
        if(nextUser?.id===state.user?.id)return;
        state.user=nextUser;state.ready=false;
        setStatus('Verbinden','Accountwisseling controleren…');
        if(!state.user)await ensureUser();
        // Do not copy a pet profile or pending anonymous reports into an authenticated maintenance account.
        if(state.user?.is_anonymous)await syncProfile();
        state.ready=true;
        document.dispatchEvent(new CustomEvent('wd:auth-changed',{detail:{userId:state.user.id,isAnonymous:Boolean(state.user.is_anonymous)}}));
        await refreshSharedReports();
        await processQueue();
      }).catch(err=>{console.warn('Accountwisseling mislukt',err);setStatus('Offline','Accountwisseling niet voltooid; probeer opnieuw')});
    });
  }

  async function boot(){
    if(!configured()){
      window.WhatsupDogCommunity={configured:false,status:'local-only'};setStatus('Lokaal','De gedeelde backend is nog niet gekoppeld');return;
    }
    try{
      setStatus('Verbinden','Veilige communityverbinding opzetten…');
      await loadScript(SUPABASE_JS,()=>Boolean(window.supabase?.createClient));
      state.client=window.supabase.createClient(CFG.url,CFG.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:window.__WD_PREVIEW__?'wd-preview-supabase-auth-v1':undefined}});
      await ensureUser();if(state.user?.is_anonymous)await syncProfile();state.ready=true;
      window.WhatsupDogCommunity={configured:true,get client(){return state.client},get user(){return state.user},refresh:refreshSharedReports,processQueue};
      // Account UI may have loaded before the backend finished restoring the
      // session from the confirmation-link redirect. Announce the initial
      // authenticated state as well as later auth transitions.
      document.dispatchEvent(new CustomEvent('wd:auth-changed',{detail:{userId:state.user.id,isAnonymous:Boolean(state.user.is_anonymous)}}));
      observeAuthentication();watchLocalReports();await refreshSharedReports();subscribe();await processQueue();
      setInterval(()=>scheduleRefresh(0),15*60*1000);
    }catch(err){console.warn('Whatsup dog community backend niet actief',err);state.ready=false;window.WhatsupDogCommunity={configured:true,status:'error',error:String(err?.message||err)};setStatus('Lokaal','Communityverbinding niet beschikbaar; meldingen blijven op dit toestel werken')}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

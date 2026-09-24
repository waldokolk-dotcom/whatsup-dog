(()=>{
  'use strict';
  const KEY='wd_reports_v1';
  const list=document.getElementById('publicFeedList');
  const status=document.getElementById('publicFeedStatus');
  if(!list||!status)return;
  const types={danger:'Gevaar',vegetation:'Vegetatie',dirty:'Vervuiling',road:'Pad / weg',fun:'Leuke plek',walk:'Samen wandelen',spotted:'Dier gespot',lost:'Vermist / gevonden'};
  const read=()=>{try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=String(text);return node};
  const speciesMode=()=>{try{const mode=JSON.parse(localStorage.getItem('wd_profile_v1')||'{}').speciesContext;return ['dog','cat','both'].includes(mode)?mode:'dog'}catch{return 'dog'}};
  let olderRows=[],exhausted=false,loading=false;
  const more=element('button','wd-feed-more','Meer openbare meldingen laden');
  more.type='button';more.hidden=true;list.insertAdjacentElement('afterend',more);
  const hiddenIds=()=>{try{return new Set(JSON.parse(localStorage.getItem('wd_hidden_reports_v1')||'[]'))}catch{return new Set()}};
  const oldest=()=>[...read().filter(r=>r&&r._remote&&r.createdAt),...olderRows].map(r=>r.createdAt).filter(Boolean).sort()[0]||null;
  async function loadOlder(){
    const client=window.WhatsupDogCommunity?.client;
    if(!client||loading||exhausted||document.documentElement.dataset.community!=='community-aan')return;
    loading=true;more.disabled=true;more.textContent='Oudere meldingen ophalen…';
    try{
      let query=client.from('reports').select('id,user_id,author_name,author_avatar,species,type,subtype,text,lat,lng,geometry_type,polygon,photo_path,created_at,confirmed_count').eq('status','active').order('created_at',{ascending:false}).limit(100);
      const before=oldest();if(before)query=query.lt('created_at',before);
      const {data,error}=await query;if(error)throw error;
      for(const row of data||[])olderRows.push({id:row.id,userId:row.user_id,author:row.author_name||'Buurtgenoot',authorAvatar:row.author_avatar||'🐾',species:row.species||'dog',type:row.type,subtype:row.subtype,text:row.text,lat:Number(row.lat),lng:Number(row.lng),geometryType:row.geometry_type||'point',polygon:row.polygon,photoPath:row.photo_path||null,confirmed:Number(row.confirmed_count||0),createdAt:row.created_at,time:row.created_at?new Date(row.created_at).toLocaleDateString('nl-NL'):'Recent',_remote:true});
      exhausted=(data||[]).length<100;render();
    }catch(err){console.warn('Oudere buurtmeldingen ophalen mislukt',err);status.textContent='Oudere meldingen ophalen lukt nu niet. Probeer het opnieuw.'}
    finally{loading=false;more.disabled=false;more.textContent='Meer openbare meldingen laden'}
  }
  more.addEventListener('click',loadOlder);
  function render(){
    list.replaceChildren();
    const connected=document.documentElement.dataset.community==='community-aan';
    if(!connected){
      status.textContent='De gedeelde meldingen zijn momenteel niet beschikbaar. Alleen bevestigde, openbare meldingen worden hier getoond.';
      more.hidden=true;return;
    }
    const mode=speciesMode();
    const blocked=hiddenIds();
    const rows=[...new Map([...read(),...olderRows].filter(r=>r&&r._remote===true&&r.id).map(r=>[r.id,r])).values()].filter(r=>!r._pending&&!r._hidden&&!blocked.has(r.id)&&(mode==='both'||r.species==='both'||(r.species||'dog')===mode))
      .sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));
    status.textContent=rows.length?`${rows.length} openbare meldingen`:'Nog geen openbare meldingen. Zodra iemand een melding deelt, verschijnt die hier.';
    more.hidden=exhausted||(!read().some(r=>r&&r._remote===true)&&olderRows.length===0);
    for(const r of rows){
      const card=element('article','wd-feed-card');
      const heading=element('div','wd-feed-card-heading');
      heading.append(element('span','wd-feed-avatar',r.authorAvatar||'🐾'));
      const info=element('div','wd-feed-card-info');
      info.append(element('strong','',types[r.type]||'Buurtmelding'));
      info.append(element('small','',`${r.author||'Buurtgenoot'} · ${r.time||'Recent'}`));
      heading.append(info);
      const description=element('p','wd-feed-description',r.text||'Melding zonder beschrijving.');
      const action=element('button','wd-feed-open','Bekijk melding');
      action.type='button';
      action.setAttribute('aria-label',`Bekijk melding: ${types[r.type]||'Buurtmelding'}`);
      action.addEventListener('click',async()=>{
              if(r.photoPath&&!r.photoDataUrl){
                try{const client=window.WhatsupDogCommunity?.client;const bucket=window.WHATSUP_DOG_BACKEND?.photoBucket||'report-photos';
                  const {data,error}=await client.storage.from(bucket).createSignedUrl(r.photoPath,3600);if(!error)r.photoDataUrl=data?.signedUrl||null;
                }catch(err){console.warn('Foto voor oudere melding niet beschikbaar',err)}
              }
              if(typeof window.openReportDetail==='function')window.openReportDetail(r);
              else if(typeof openReportDetail==='function')openReportDetail(r);
            });
      card.append(heading,description,action);
      list.append(card);
    }
  }
  document.addEventListener('wd:shared-reports-updated',()=>{olderRows=[];exhausted=false;render()});
  document.addEventListener('wd:profile-updated',render);
  document.addEventListener('wd:community-status',render);
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key==='wd_profile_v1')render()});
  render();
})();

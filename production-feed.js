(()=>{
  'use strict';
  const KEY='wd_reports_v1';
  const list=document.getElementById('publicFeedList');
  const status=document.getElementById('publicFeedStatus');
  if(!list||!status)return;
  const types={danger:'Gevaar',vegetation:'Vegetatie',dirty:'Vervuiling',road:'Pad / weg',fun:'Leuke plek',walk:'Samen wandelen',spotted:'Dier gespot',lost:'Vermist / gevonden'};
  const read=()=>{try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=String(text);return node};
  function render(){
    list.replaceChildren();
    const connected=document.documentElement.dataset.community==='community-aan';
    if(!connected){
      status.textContent='De gedeelde meldingen zijn momenteel niet beschikbaar. Alleen bevestigde, openbare meldingen worden hier getoond.';
      return;
    }
    const rows=read().filter(r=>r&&r._remote===true&&r.id&&!r._pending&&!r._hidden)
      .sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));
    status.textContent=rows.length?`${rows.length} openbare meldingen`:'Nog geen openbare meldingen. Zodra iemand een melding deelt, verschijnt die hier.';
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
      action.addEventListener('click',()=>{
        if(typeof window.openReportDetail==='function')window.openReportDetail(r);
        else if(typeof openReportDetail==='function')openReportDetail(r);
      });
      card.append(heading,description,action);
      list.append(card);
    }
  }
  document.addEventListener('wd:shared-reports-updated',render);
  document.addEventListener('wd:community-status',render);
  window.addEventListener('storage',event=>{if(event.key===KEY)render()});
  render();
})();

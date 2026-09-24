(()=>{
  'use strict';
  const KEY='wd_alert_preferences_v1';
  const choices={danger:'wdAlertDanger',vegetation:'wdAlertVegetation',lost:'wdAlertLost',activities:'wdAlertActivities'};
  const defaults={danger:true,vegetation:true,lost:true,activities:false};
  const status=document.getElementById('wdAlertStatus');
  const list=document.getElementById('wdAlertList');
  if(!status||!list)return;
  const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
  const saved=safeRead(KEY,{});
  const preferences=Object.fromEntries(Object.entries(defaults).map(([key,value])=>[key,typeof saved[key]==='boolean'?saved[key]:value]));
  const category=type=>type==='vegetation'?'vegetation':type==='lost'?'lost':['danger','dirty','road'].includes(type)?'danger':'activities';
  const labels={danger:'Gevaar',vegetation:'Vegetatie',lost:'Vermist / gevonden',activities:'Buurtactiviteit'};
  const node=(tag,className,value)=>{const result=document.createElement(tag);if(className)result.className=className;if(value!=null)result.textContent=String(value);return result};
  const speciesMode=()=>{const mode=safeRead('wd_profile_v1',{}).speciesContext;return ['dog','cat','both'].includes(mode)?mode:'dog'};
  function render(){
    list.replaceChildren();
    if(document.documentElement.dataset.community!=='community-aan'){
      status.textContent='De gedeelde meldingen zijn nu niet beschikbaar. We tonen geen lokale meldingen alsof ze openbaar zijn.';
      return;
    }
    const species=speciesMode(),hidden=new Set(safeRead('wd_hidden_reports_v1',[]));
    const rows=safeRead('wd_reports_v1',[]).filter(r=>r&&r.id&&r._remote===true&&!hidden.has(r.id)&&preferences[category(r.type)]&&(species==='both'||r.species==='both'||(r.species||'dog')===species)).sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));
    status.textContent=rows.length?rows.length+' meldingen volgens jouw voorkeuren':'Geen meldingen binnen jouw gekozen categorieën.';
    for(const report of rows){
      const card=node('article','wd-feed-card'),head=node('div','wd-feed-card-heading');
      const info=node('div','wd-feed-card-info');
      info.append(node('strong','',labels[category(report.type)]),node('small','',(report.author||'Buurtgenoot')+' · '+(report.time||'Recent')));
      head.append(node('span','wd-feed-avatar',report.authorAvatar||'🐾'),info);
      const open=node('button','wd-feed-open','Bekijk melding');open.type='button';
      open.addEventListener('click',()=>{if(typeof window.openReportDetail==='function')window.openReportDetail(report);else if(typeof openReportDetail==='function')openReportDetail(report)});
      card.append(head,node('p','wd-feed-description',report.text||'Melding zonder beschrijving.'),open);
      list.append(card);
    }
  }
  for(const [key,id] of Object.entries(choices)){
    const input=document.getElementById(id);if(!input)continue;
    input.checked=preferences[key];
    input.addEventListener('change',()=>{preferences[key]=input.checked;try{localStorage.setItem(KEY,JSON.stringify(preferences))}catch{}render()});
  }
  document.getElementById('wdAlertAll')?.addEventListener('click',()=>document.querySelector('.bottom-nav [data-view="feed"]')?.click());
  document.addEventListener('wd:shared-reports-updated',render);
  document.addEventListener('wd:profile-updated',render);
  document.addEventListener('wd:community-status',render);
  window.addEventListener('storage',event=>{if(['wd_reports_v1','wd_profile_v1','wd_hidden_reports_v1',KEY].includes(event.key))render()});
  render();
})();

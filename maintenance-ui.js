(()=>{
  'use strict';
  let checkedUser=null,refreshing=false;
  const section=document.createElement('section');
  section.id='wdMaintenance';section.className='wd-maintenance settings-card compact';section.hidden=true;
  const title=document.createElement('h2');title.textContent='Onderhoud Whatsup Dog';
  const explanation=document.createElement('p');explanation.textContent='Alleen voor bevoegde beheerders. Deze lijst is niet zichtbaar voor gewone gebruikers.';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='primary wide';toggle.textContent='Open onderhoudslijst';
  const panel=document.createElement('div');panel.id='wdMaintenancePanel';panel.hidden=true;
  const status=document.createElement('p');status.id='wdMaintenanceStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const rows=document.createElement('div');rows.className='wd-maintenance-list';
  panel.append(status,rows);section.append(title,explanation,toggle,panel);
  document.querySelector('#view-profile')?.append(section);
  const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=String(value);return n};
  async function authorize(){
    const community=window.WhatsupDogCommunity;
    if(!community?.client||!community?.user){section.hidden=true;checkedUser=null;return}
    if(checkedUser===community.user.id)return;
    section.hidden=true;panel.hidden=true;checkedUser=null;
    try{
      const {data,error}=await community.client.rpc('is_report_moderator');
      if(error||data!==true)return;
      if(window.WhatsupDogCommunity?.user?.id!==community.user.id)return;
      checkedUser=community.user.id;section.hidden=false;
    }catch{section.hidden=true}
  }
  async function load(){
    if(refreshing||!checkedUser)return;refreshing=true;status.textContent='Onderhoudslijst ophalen…';rows.replaceChildren();
    const community=window.WhatsupDogCommunity;
    if(community?.user?.id!==checkedUser){section.hidden=true;refreshing=false;return}
    try{
      const {data,error}=await community.client.from('reports')
        .select('id,user_id,author_name,type,text,status,created_at')
        .order('created_at',{ascending:false}).limit(200);
      if(error)throw error;
      status.textContent=`${data?.length||0} meldingen · maximaal 200 meest recente`;
      for(const report of data||[]){
        const card=el('article','wd-maintenance-report');
        const heading=el('strong','',`${report.type||'Melding'} · ${report.status||'onbekend'}`);
        const meta=el('small','',`${report.author_name||'Gebruiker'} · ${report.created_at?new Date(report.created_at).toLocaleString('nl-NL'):'Datum onbekend'}`);
        const description=el('p','',report.text||'Geen omschrijving');
        const actions=el('div','wd-maintenance-actions');
        const reportStatus=el('span','wd-maintenance-result','');
        for(const [next,label] of [['hidden','Verbergen'],['resolved','Opgelost']]){
          if(report.status===next)continue;
          const button=el('button','wd-maintenance-action',label);button.type='button';
          button.addEventListener('click',async()=>{
            const reason=window.prompt(`Reden voor ${label.toLowerCase()} van deze melding (verplicht):`);
            if(!reason?.trim())return;
            button.disabled=true;reportStatus.textContent='Bezig…';
            try{
              const current=window.WhatsupDogCommunity;
              if(current?.user?.id!==checkedUser)throw new Error('Beheersessie verlopen');
              const {error:moderationError}=await current.client.rpc('moderate_report',{target:report.id,next_status:next,explanation:reason.trim().slice(0,500)});
              if(moderationError)throw moderationError;
              reportStatus.textContent='Beheeractie opgeslagen';await loadAfterAction();
            }catch(err){reportStatus.textContent='Actie mislukt. Probeer opnieuw.';console.warn('Beheeractie mislukt',err)}
            finally{button.disabled=false}
          });actions.append(button);
        }
        card.append(heading,meta,description,actions,reportStatus);rows.append(card);
      }
    }catch(err){status.textContent='Onderhoudslijst niet beschikbaar. Controleer je bevoegdheden en verbinding.';console.warn('Onderhoudslijst mislukt',err)}
    finally{refreshing=false}
  }
  async function loadAfterAction(){refreshing=false;await load();await window.WhatsupDogCommunity?.refresh?.()}
  toggle.addEventListener('click',async()=>{panel.hidden=!panel.hidden;toggle.textContent=panel.hidden?'Open onderhoudslijst':'Sluit onderhoudslijst';if(!panel.hidden)await load()});
  document.addEventListener('wd:community-status',()=>authorize());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')authorize()});
  authorize();
})();

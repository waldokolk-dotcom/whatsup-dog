(()=>{
  const REPORTS_KEY='wd_reports_v1';
  const HIDDEN_KEY='wd_hidden_reports_v1';
  const QUEUE_KEY='wd_shared_report_queue_v1';
  const LEGACY_CUTOFF=Date.parse('2026-09-13T14:30:00Z');

  const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const reports=()=>parse(REPORTS_KEY,[]);
  const hidden=()=>parse(HIDDEN_KEY,[]);
  const queue=()=>parse(QUEUE_KEY,[]);

  function addHidden(id){if(!id)return;const ids=hidden();if(!ids.includes(id)){ids.push(id);write(HIDDEN_KEY,ids)}}
  function removeFromQueue(id){write(QUEUE_KEY,queue().filter(x=>x!==id))}
  function removeLocal(id){write(REPORTS_KEY,reports().filter(x=>x.id!==id));removeFromQueue(id);try{drawReports()}catch{}try{updateProfileUI()}catch{}try{window.refreshWhatsupHome?.()}catch{}}
  function closeDetail(){try{el('detailDialog')?.close()}catch{}}
  function message(text){try{toast(text)}catch{}}

  async function setOwnRemoteStatus(report,status){
    const community=window.WhatsupDogCommunity;
    const client=community?.client,user=community?.user;
    if(!report?._remote||!client||!user||report.userId!==user.id)return false;
    const {error}=await client.rpc('set_own_report_status',{target:report.id,next_status:status});
    if(error)throw error;
    return true;
  }

  function purgeLegacyReports(){
    const rows=reports();let changed=false;
    const keep=[];
    for(const r of rows){
      const created=Date.parse(r?.createdAt||'');
      if(r?._remote&&Number.isFinite(created)&&created<LEGACY_CUTOFF){addHidden(r.id);changed=true;continue}
      keep.push(r);
    }
    if(changed){write(REPORTS_KEY,keep);try{drawReports()}catch{}try{updateProfileUI()}catch{}try{window.refreshWhatsupHome?.()}catch{}}
  }

  window.markReportResolved=async function(report){
    try{
      if(report?._remote){
        const global=await setOwnRemoteStatus(report,'resolved');
        if(!global)addHidden(report.id);
      }
      removeLocal(report?.id);closeDetail();message('Melding gemarkeerd als opgelost');
      try{await window.WhatsupDogCommunity?.refresh?.()}catch{}
    }catch(err){console.warn('Melding oplossen mislukt',err);message('Oplossen lukt nu niet. Probeer het nog eens.')}
  };

  window.deleteReport=async function(report){
    if(!confirm('Deze melding wissen?'))return;
    try{
      if(report?._remote){
        const global=await setOwnRemoteStatus(report,'hidden');
        if(!global)addHidden(report.id);
      }
      addHidden(report?.id);removeLocal(report?.id);closeDetail();message('Melding gewist');
      try{await window.WhatsupDogCommunity?.refresh?.()}catch{}
    }catch(err){console.warn('Melding wissen mislukt',err);message('Wissen lukt nu niet. Probeer het nog eens.')}
  };

  document.addEventListener('wd:shared-reports-updated',purgeLegacyReports);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(purgeLegacyReports,700),{once:true});else setTimeout(purgeLegacyReports,700);
  window.WHATSUP_DOG_REPORT_LIFECYCLE={legacyCutoff:LEGACY_CUTOFF,purgeLegacyReports};
})();

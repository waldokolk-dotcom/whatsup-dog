(()=>{
'use strict';
// This tool is deliberately local-only. Another account's server records are
// never changed by deleting a browser cache or by knowing an email address.
const REPORTS='wd_reports_v1';
const HIDDEN='wd_hidden_reports_v1';
const QUEUE='wd_shared_report_queue_v1';
const $=id=>document.getElementById(id);
const account=()=>window.WhatsupDogCommunity?.user;
const verified=()=>Boolean(account()?.id&&!account()?.is_anonymous);
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}};
const root=document.createElement('section');
root.id='wdLegacyCleanup';root.className='wd-account settings-card compact';root.hidden=true;
root.innerHTML='<h2>Oude meldingen opruimen</h2><p>Staan hier nog meldingen van vroeger, onder een andere naam? Je kunt ze van dit apparaat verwijderen of verbergen. Meldingen van andere accounts blijven voor anderen op de server bestaan.</p><p id="wdLegacyCount" role="status" aria-live="polite"></p><div id="wdLegacyRows" class="wd-legacy-rows"></div><div class="wd-legacy-actions"><button id="wdLegacyRefresh" type="button" class="outline-btn">Lijst verversen</button><button id="wdLegacyRemove" type="button" class="outline-btn danger-action" disabled>Geselecteerde meldingen opruimen</button></div><p id="wdLegacyStatus" role="status" aria-live="polite"></p>';
const css=document.createElement('style');
css.id='wd-legacy-cleanup-style';
css.textContent='.wd-legacy-rows{display:grid;gap:8px}.wd-legacy-row{display:flex!important;align-items:flex-start;gap:10px;padding:10px;border:1px solid #d5e2d8;border-radius:12px;background:#fff;font-weight:500!important}.wd-legacy-row input{display:block!important;flex:0 0 22px!important;width:22px!important;min-height:22px!important;margin:1px 0 0!important;accent-color:#176b52}.wd-legacy-row span{min-width:0;overflow-wrap:anywhere}.wd-legacy-row small{display:block;color:#5a665f;font-size:12px;margin-top:4px}.wd-legacy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.wd-legacy-actions button{min-height:48px}.wd-legacy-rows:empty{display:none}';
document.head.append(css);
const profile=$('view-profile');
if(!profile)return;
profile.append(root);
const list=$('wdLegacyRows'),count=$('wdLegacyCount'),status=$('wdLegacyStatus'),remove=$('wdLegacyRemove');
let visibleIds=new Set();
function eligible(){
 const id=account()?.id;
 if(!verified()||window.__WD_PREVIEW__)return [];
 return read(REPORTS,[]).filter(r=>r&&typeof r.id==='string'&&
   r._accountOwner!==id&&r.userId!==id&&
   !read(HIDDEN,[]).includes(r.id));
}
function refresh(){
 root.hidden=!verified()||Boolean(window.__WD_PREVIEW__);
 list.replaceChildren();visibleIds=new Set();remove.disabled=true;
 if(root.hidden)return;
 const rows=eligible();
 count.textContent=rows.length?rows.length+' oude of anders geregistreerde meldingen op dit apparaat.':'Geen oude meldingen op dit apparaat gevonden.';
 for(const r of rows){
  const label=document.createElement('label');label.className='wd-legacy-row';
  const check=document.createElement('input');check.type='checkbox';check.value=r.id;check.setAttribute('aria-label','Selecteer oude melding');
  const info=document.createElement('span');info.textContent=String(r.text||r.subtype||r.type||'Melding').slice(0,220);
  const detail=document.createElement('small');detail.textContent=(r.author||'Onbekende naam')+(r._remote?' · gedeeld: alleen op dit apparaat verbergen':' · alleen op dit apparaat');
  info.append(detail);label.append(check,info);list.append(label);visibleIds.add(r.id);
 }
 status.textContent='';
}
list.addEventListener('change',()=>{remove.disabled=!list.querySelector('input:checked')});
$('wdLegacyRefresh').addEventListener('click',refresh);
remove.addEventListener('click',()=>{
 if(!verified()||window.__WD_PREVIEW__)return;
 const chosen=[...list.querySelectorAll('input:checked')].map(x=>x.value).filter(id=>visibleIds.has(id));
 if(!chosen.length)return;
 const latest=new Map(eligible().map(r=>[r.id,r]));
 const selected=chosen.filter(id=>latest.has(id));
 if(!selected.length){refresh();return}
 const remote=selected.filter(id=>latest.get(id)?._remote).length;
 const question='Wil je '+selected.length+' geselecteerde meldingen op dit apparaat opruimen?'+
  (remote?' '+remote+' gedeelde meldingen worden alleen op dit apparaat verborgen; voor anderen blijven ze zichtbaar.':'')+
  ' Dit verwijdert geen accounts of meldingen van anderen uit de database.';
 if(!window.confirm(question))return;
 const ids=new Set(selected);
 try{
  // Append to the existing per-device hidden list before removing cached rows:
  // community refresh must not re-import remote items for this browser.
  const hidden=new Set(read(HIDDEN,[]));for(const id of ids)hidden.add(id);
  localStorage.setItem(HIDDEN,JSON.stringify([...hidden]));
  localStorage.setItem(REPORTS,JSON.stringify(read(REPORTS,[]).filter(r=>!ids.has(r?.id))));
  localStorage.setItem(QUEUE,JSON.stringify(read(QUEUE,[]).filter(id=>!ids.has(id))));
  try{drawReports()}catch{}
  try{updateProfileUI()}catch{}
  try{window.refreshWhatsupHome?.()}catch{}
  document.dispatchEvent(new CustomEvent('wd:shared-reports-updated'));
  status.textContent=selected.length+' meldingen op dit apparaat opgeruimd. Meldingen van anderen zijn niet op de server verwijderd.';
  refresh();status.textContent=selected.length+' meldingen op dit apparaat opgeruimd. Meldingen van anderen zijn niet op de server verwijderd.';
 }catch(err){
  console.warn('Lokaal opruimen mislukt',err);
  status.textContent='Opruimen lukte niet. Er zijn geen meldingen van anderen op de server verwijderd.';
 }
});
document.addEventListener('wd:auth-changed',refresh);
document.addEventListener('wd:shared-reports-updated',()=>{if(!root.hidden)refresh()});
refresh();
})();
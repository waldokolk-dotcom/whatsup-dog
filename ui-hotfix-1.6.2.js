(()=>{
  const TYPE_NL={danger:'Gevaar',vegetation:'Vegetatie',dirty:'Vervuiling',road:'Pad / weg',fun:'Leuke plek',walk:'Samen wandelen',spotted:'Hond gespot',lost:'Vermist / gevonden'};
  let scheduled=false;

  function injectStyles(){
    if(document.getElementById('wd-hotfix-162-style'))return;
    const s=document.createElement('style');s.id='wd-hotfix-162-style';s.textContent=`
      #removePhotoV2.wd-remove-photo-text{position:static!important;inset:auto!important;width:100%!important;height:auto!important;min-height:44px!important;margin-top:8px!important;border-radius:12px!important;background:#fff!important;border:1.5px solid #d9cfc2!important;color:#7f2f28!important;font-weight:900!important;font-size:13px!important;display:block!important;box-shadow:none!important}
      #photoPreviewWrapV2.has-photo{display:block!important}
      #continueAfterPhotoV2{width:100%;min-height:46px;margin-top:8px;border:0;border-radius:13px;background:#eef4e7;color:#3b2418;font-weight:1000}
      .wd-photo-ready-note{margin:8px 0 0;font-size:11px;line-height:1.4;color:#65594f;text-align:center}
    `;document.head.appendChild(s);
  }

  function removeFakeUnreadBadges(){document.querySelectorAll('#chatList .chat-count').forEach(el=>el.remove())}

  function setTextIfChanged(node,text){if(node&&node.textContent!==text)node.textContent=text}

  function improvePhotoFlow(){
    const remove=document.getElementById('removePhotoV2');
    const recognize=document.getElementById('recognizePhotoV2');
    const preview=document.getElementById('photoPreviewWrapV2');
    if(remove){setTextIfChanged(remove,'🗑️ Foto verwijderen');remove.classList.add('wd-remove-photo-text');remove.setAttribute('aria-label','Foto verwijderen')}
    if(recognize&&recognize.disabled)setTextIfChanged(recognize,'✨ Herken deze foto');
    if(preview&&!document.getElementById('continueAfterPhotoV2')){
      const btn=document.createElement('button');btn.type='button';btn.id='continueAfterPhotoV2';btn.textContent='Verder met melding ↓';
      btn.addEventListener('click',()=>{const target=document.getElementById('reportAdminMeta')||document.getElementById('pickOnMapV2')||document.getElementById('reportText');target?.scrollIntoView({behavior:'smooth',block:'center'})});
      const note=document.createElement('p');note.className='wd-photo-ready-note';note.textContent='Foto staat klaar. Je kunt hem laten herkennen, verwijderen of verdergaan met de melding.';
      if(remove&&!remove.isConnected)preview.insertAdjacentElement('afterend',remove);
      const anchor=remove?.isConnected?remove:preview;
      if(recognize&&!recognize.isConnected)anchor.insertAdjacentElement('afterend',recognize);
      const after=recognize?.isConnected?recognize:anchor;after.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',note)
    }
  }

  function afterPhotoPicked(){setTimeout(()=>{improvePhotoFlow();const wrap=document.getElementById('photoPreviewWrapV2');if(wrap?.classList.contains('has-photo'))document.getElementById('recognizePhotoV2')?.scrollIntoView({behavior:'smooth',block:'center'})},120)}

  function installPhotoListeners(){['reportCameraV2','reportPhotoV2'].forEach(id=>{const input=document.getElementById(id);if(!input||input.dataset.wdHotfix162)return;input.dataset.wdHotfix162='1';input.addEventListener('change',afterPhotoPicked)})}

  function translateReportList(){const table=document.querySelector('#reportListWrap .report-list-table');if(!table)return;table.querySelectorAll('tbody tr').forEach(row=>{const cell=row.children?.[1];if(!cell)return;const raw=(cell.textContent||'').trim().toLowerCase();if(TYPE_NL[raw]&&cell.textContent.trim()!==TYPE_NL[raw])cell.innerHTML=`<b>${TYPE_NL[raw]}</b>`})}

  function reconcile(){scheduled=false;removeFakeUnreadBadges();improvePhotoFlow();installPhotoListeners();translateReportList()}
  function scheduleReconcile(){if(scheduled)return;scheduled=true;requestAnimationFrame(reconcile)}

  function boot(){injectStyles();reconcile();const obs=new MutationObserver(scheduleReconcile);obs.observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

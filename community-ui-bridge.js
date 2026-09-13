(()=>{
  function loadDialogUi(){
    if(document.querySelector('script[data-wd-dialog-ui]'))return;
    const script=document.createElement('script');
    script.src='./dialog-ui.js?v=3';
    script.async=false;
    script.dataset.wdDialogUi='1';
    document.body.appendChild(script);
  }
  function redrawSharedShapes(){
    try{window.WHATSUP_DOG_SMART_REPORT_V3?.render?.()}catch(err){console.warn('Gedeelde vlakken konden niet worden hertekend',err)}
  }
  loadDialogUi();
  document.addEventListener('wd:shared-reports-updated',redrawSharedShapes);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(redrawSharedShapes,350),{once:true});
})();

(()=>{
  function loadDialogUi(){
    if(document.querySelector('script[data-wd-dialog-ui]'))return;
    const script=document.createElement('script');
    script.src='./dialog-ui.js?v=3';
    script.async=false;
    script.dataset.wdDialogUi='1';
    document.body.appendChild(script);
  }
  function loadCommunityTools(){
    if(document.querySelector('script[data-wd-community-tools]'))return;
    const script=document.createElement('script');
    script.src='./community-tools.js?v=1.8.0';
    script.async=false;
    script.dataset.wdCommunityTools='1';
    document.body.appendChild(script);
  }
  function loadUiHotfix(){
    if(document.querySelector('script[data-wd-hotfix-162]'))return;
    const script=document.createElement('script');
    script.src='./ui-hotfix-1.6.2.js?v=2';
    script.async=false;
    script.dataset.wdHotfix162='1';
    document.body.appendChild(script);
  }
  function redrawSharedShapes(){
    try{window.WHATSUP_DOG_SMART_REPORT_V3?.render?.()}catch(err){console.warn('Gedeelde vlakken konden niet worden hertekend',err)}
  }
  loadDialogUi();
  import('./version.js?v=1.8.0').catch(err=>console.warn('Versiecontroller kon niet laden',err));
  import('./mobile-ui.js?v=1.8.0').catch(err=>console.warn('Mobiele UI kon niet laden',err));
  import('./profile-ui.js?v=1').catch(err=>console.warn('Profiel-UI kon niet laden',err));
  loadCommunityTools();
  loadUiHotfix();
  document.addEventListener('wd:shared-reports-updated',redrawSharedShapes);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(redrawSharedShapes,350),{once:true});
})();

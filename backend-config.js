// Whatsup dog community backend configuration.
// Only the Supabase project URL and publishable/anon key belong here.
// Never place privileged server credentials in browser code.
window.WHATSUP_DOG_BACKEND={
  provider:'supabase',
  enabled:true,
  url:'https://dohelzkgruxnmejmplgw.supabase.co',
  publishableKey:'sb_publishable_f_o39KqeR78WnFFts8nWCA_NYytndFT',
  photoBucket:'report-photos',
  maxSharedReports:200,
  signedPhotoSeconds:3600
};

function loadWhatsupDogSupportScript(selector,src,datasetKey){
  if(document.querySelector(selector))return;
  const script=document.createElement('script');
  script.src=src;
  script.async=false;
  script.dataset[datasetKey]='1';
  document.body.appendChild(script);
}

loadWhatsupDogSupportScript('script[data-wd-community-ui]','./community-ui-bridge.js?v=1','wdCommunityUi');
loadWhatsupDogSupportScript('script[data-wd-report-lifecycle]','./report-lifecycle.js?v=1','wdReportLifecycle');

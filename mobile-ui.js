(()=>{
  function inject(){
    if(document.getElementById('wd-mobile-ui-style'))return;
    const s=document.createElement('style');s.id='wd-mobile-ui-style';s.textContent=`
      :root{--wd-touch:44px;--wd-nav-safe:calc(82px + env(safe-area-inset-bottom));}
      html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
      body{min-width:320px;overflow-x:hidden}
      button,.chip,.segment,.subtype,.report-type,.nav-item,.round-action,.text-action,.outline-btn,.blue-btn,.primary,.continue-btn{min-height:var(--wd-touch)}
      input,textarea,select{font-size:16px!important;min-height:44px}
      .bottom-nav{height:var(--wd-nav-safe)!important;padding-bottom:calc(7px + env(safe-area-inset-bottom))!important}
      .app-shell{padding-bottom:var(--wd-nav-safe)!important}
      .page-view{padding-bottom:calc(var(--wd-nav-safe) + 24px)!important}
      .map-view{height:calc(100dvh - var(--wd-nav-safe))!important;min-height:420px!important}
      .map-bottom-card{bottom:calc(12px + env(safe-area-inset-bottom))!important}
      .chat-compose{bottom:calc(var(--wd-nav-safe) + 8px)!important}
      .sheet-card,.onboarding-card{max-width:min(680px,calc(100vw - 12px))!important}
      .onboarding-body,.sheet-card{-webkit-overflow-scrolling:touch}
      .chip-row,.segment-row{scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
      .chip,.segment{scroll-snap-align:start}
      .map-fab,.avatar-btn,.dialog-close,.conversation-back{min-width:44px;min-height:44px}
      .leaflet-control-zoom a{min-width:44px!important;min-height:44px!important;line-height:44px!important}
      @media(max-width:600px){
        .home-header,.page-view{padding-left:max(12px,env(safe-area-inset-left))!important;padding-right:max(12px,env(safe-area-inset-right))!important}
        .home-actions{gap:8px!important}
        .home-action{min-height:96px!important;padding:12px 8px!important}
        .home-action b{font-size:13px!important}.home-action small{font-size:10px!important}
        .map-brand-card{max-width:205px!important;left:10px!important;top:10px!important}
        .map-brand-card strong{font-size:17px!important}.map-brand-card small{font-size:9px!important}
        .map-search{right:10px!important;top:10px!important}
        .report-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
        .report-type{min-height:90px!important;padding:10px 6px!important}
        .sheet-card h2{font-size:24px!important}
        .onboarding-photo{flex-basis:145px!important}
        .onboarding-body{padding-left:14px!important;padding-right:14px!important}
        .onboarding-body h2{font-size:27px!important}
        .welcome-points{font-size:11px!important}
        .avatar-grid{max-height:190px!important}
        .bottom-nav{gap:1px!important;padding-left:4px!important;padding-right:4px!important}
        .nav-item small{font-size:9px!important}
      }
      @media(max-width:380px){
        .home-actions{grid-template-columns:1fr!important}
        .home-action{min-height:72px!important;grid-template-columns:42px 1fr!important;align-items:center!important;text-align:left!important}
        .home-action span{grid-row:1/3!important}.report-grid{gap:6px!important}.report-type{font-size:12px!important}
      }
      @media(max-height:650px) and (orientation:landscape){
        .onboarding-photo{display:none!important}
        .onboarding-card{height:calc(100dvh - 8px)!important}
        .sheet-card{max-height:calc(100dvh - 8px)!important}
        .map-toolbar{top:60px!important}
      }
      @media(pointer:coarse){button{touch-action:manipulation}.dialog-drag-handle{min-height:36px}}
      .map-bottom-card{left:auto!important;right:12px!important;bottom:14px!important;border-radius:0!important}
      .map-bottom-card .report-fab{width:auto!important;min-height:54px!important}
      .map-toolbar{top:78px!important;padding:0!important}
    `;document.head.appendChild(s);
    const layers=document.getElementById('layersButton'),filters=document.getElementById('filterRow');
    layers?.addEventListener('click',()=>{const open=filters?.hasAttribute('hidden');filters?.toggleAttribute('hidden',!open);layers.setAttribute('aria-expanded',String(Boolean(open)))});
    filters?.addEventListener('click',e=>{if(e.target.closest('.chip')){filters.setAttribute('hidden','');layers?.setAttribute('aria-expanded','false')}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
})();

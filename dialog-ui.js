(()=>{
  const STYLE_ID='wd-dialog-ui-style';
  const CARD_SELECTOR='.sheet-card,.onboarding-card';

  function injectStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .full-dialog,.sheet-dialog{overflow:hidden!important;padding:0!important}
      .onboarding-card,.sheet-card{
        --dialog-x:0px;--dialog-y:0px;
        position:fixed!important;
        left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;
        transform:translate(calc(-50% + var(--dialog-x)),calc(-50% + var(--dialog-y)))!important;
        width:min(680px,calc(100vw - 24px))!important;
        max-height:calc(100dvh - 24px)!important;
        height:auto!important;
        border-radius:28px!important;
        overflow:hidden!important;
        box-shadow:0 22px 70px rgba(42,31,23,.28)!important;
        overscroll-behavior:contain;
      }
      .onboarding-card{display:flex!important;flex-direction:column!important;height:min(860px,calc(100dvh - 24px))!important}
      .onboarding-photo{flex:0 0 190px!important}
      .onboarding-body{
        flex:1 1 auto!important;min-height:0!important;overflow:auto!important;
        scrollbar-gutter:stable;padding-right:18px!important;
        border-radius:28px 28px 0 0!important;
      }
      .sheet-card{
        display:block!important;
        overflow:auto!important;
        scrollbar-gutter:stable;
        padding:34px 18px 24px!important;
      }
      .sheet-card::-webkit-scrollbar,.onboarding-body::-webkit-scrollbar{width:10px}
      .sheet-card::-webkit-scrollbar-track,.onboarding-body::-webkit-scrollbar-track{background:transparent;margin:22px 0}
      .sheet-card::-webkit-scrollbar-thumb,.onboarding-body::-webkit-scrollbar-thumb{background:rgba(59,36,24,.32);border:3px solid transparent;background-clip:padding-box;border-radius:999px}
      .dialog-drag-handle{
        position:sticky;top:-26px;z-index:40;width:64px;height:24px;margin:-6px auto 2px;
        display:grid;place-items:center;touch-action:none;cursor:grab;user-select:none;
      }
      .dialog-drag-handle::before{content:"";width:44px;height:5px;border-radius:999px;background:rgba(59,36,24,.28)}
      .dialog-drag-handle:active{cursor:grabbing}
      .onboarding-card>.dialog-drag-handle{
        position:absolute;top:8px;left:50%;transform:translateX(-50%);margin:0;
        background:rgba(255,253,248,.72);border-radius:999px;backdrop-filter:blur(5px)
      }
      .dialog-close{border-radius:50%!important}
      @media(max-width:520px){
        .onboarding-card,.sheet-card{width:calc(100vw - 12px)!important;max-height:calc(100dvh - 12px)!important;border-radius:24px!important}
        .onboarding-card{height:calc(100dvh - 12px)!important}
        .sheet-card{padding-left:14px!important;padding-right:14px!important}
      }
      @media(prefers-reduced-motion:reduce){.onboarding-card,.sheet-card{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function clampOffset(card,x,y){
    const rect=card.getBoundingClientRect();
    const margin=8;
    const halfW=rect.width/2,halfH=rect.height/2;
    const maxX=Math.max(0,window.innerWidth/2-halfW-margin);
    const maxY=Math.max(0,window.innerHeight/2-halfH-margin);
    return {x:Math.max(-maxX,Math.min(maxX,x)),y:Math.max(-maxY,Math.min(maxY,y))};
  }

  function resetCard(card){
    card.dataset.dragX='0';card.dataset.dragY='0';
    card.style.setProperty('--dialog-x','0px');card.style.setProperty('--dialog-y','0px');
    const scroller=card.classList.contains('onboarding-card')?card.querySelector('.onboarding-body'):card;
    if(scroller)scroller.scrollTop=0;
  }

  function enableDrag(card){
    if(card.dataset.dialogDragReady==='1')return;
    card.dataset.dialogDragReady='1';
    const handle=document.createElement('div');
    handle.className='dialog-drag-handle';
    handle.setAttribute('role','button');
    handle.setAttribute('tabindex','0');
    handle.setAttribute('aria-label','Popup verslepen');
    card.prepend(handle);
    let drag=null;
    handle.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      const startX=Number(card.dataset.dragX||0),startY=Number(card.dataset.dragY||0);
      drag={pointerId:e.pointerId,startPointerX:e.clientX,startPointerY:e.clientY,startX,startY};
      handle.setPointerCapture?.(e.pointerId);e.preventDefault();
    });
    handle.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.pointerId)return;
      const next=clampOffset(card,drag.startX+e.clientX-drag.startPointerX,drag.startY+e.clientY-drag.startPointerY);
      card.dataset.dragX=String(next.x);card.dataset.dragY=String(next.y);
      card.style.setProperty('--dialog-x',`${next.x}px`);card.style.setProperty('--dialog-y',`${next.y}px`);
    });
    const end=e=>{if(drag&&(!e||e.pointerId===drag.pointerId))drag=null};
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    handle.addEventListener('keydown',e=>{
      const step=e.shiftKey?30:12;
      const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
      const dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
      if(!dx&&!dy){if(e.key==='Home'){resetCard(card);e.preventDefault()}return}
      const next=clampOffset(card,Number(card.dataset.dragX||0)+dx,Number(card.dataset.dragY||0)+dy);
      card.dataset.dragX=String(next.x);card.dataset.dragY=String(next.y);
      card.style.setProperty('--dialog-x',`${next.x}px`);card.style.setProperty('--dialog-y',`${next.y}px`);e.preventDefault();
    });
  }

  function setupDialog(dialog){
    const card=dialog.querySelector(CARD_SELECTOR);if(!card)return;
    enableDrag(card);
    dialog.addEventListener('close',()=>resetCard(card));
    const observer=new MutationObserver(()=>{if(dialog.open&&!dialog.dataset.wasOpen){dialog.dataset.wasOpen='1';resetCard(card)}else if(!dialog.open){delete dialog.dataset.wasOpen}});
    observer.observe(dialog,{attributes:true,attributeFilter:['open']});
    if(dialog.open){dialog.dataset.wasOpen='1';resetCard(card)}
  }

  function boot(){
    injectStyles();
    document.querySelectorAll('dialog').forEach(setupDialog);
    window.addEventListener('resize',()=>document.querySelectorAll(CARD_SELECTOR).forEach(card=>{
      const next=clampOffset(card,Number(card.dataset.dragX||0),Number(card.dataset.dragY||0));
      card.dataset.dragX=String(next.x);card.dataset.dragY=String(next.y);
      card.style.setProperty('--dialog-x',`${next.x}px`);card.style.setProperty('--dialog-y',`${next.y}px`);
    }),{passive:true});
    window.WHATSUP_DOG_DIALOG_UI={reset:()=>document.querySelectorAll(CARD_SELECTOR).forEach(resetCard)};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

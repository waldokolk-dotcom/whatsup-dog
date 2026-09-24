/* GitHub Pages preview only. Loaded before any app script. No real user data changes. */
'use strict';
window.__WD_PREVIEW__=true;
window.__wdPreviewStorage=(()=>{
  const real=window.localStorage,prefix='wd-preview-';
  const namespaced=key=>prefix+String(key);
  return Object.freeze({
    getItem:key=>real.getItem(namespaced(key)),
    setItem:(key,value)=>real.setItem(namespaced(key),String(value)),
    removeItem:key=>real.removeItem(namespaced(key)),
    clear:()=>{for(const key of Object.keys(real))if(key.startsWith(prefix))real.removeItem(key)},
    key:index=>Object.keys(real).filter(key=>key.startsWith(prefix))[index]?.slice(prefix.length)??null,
    get length(){return Object.keys(real).filter(key=>key.startsWith(prefix)).length}
  });
})();
// The app's bare localStorage references resolve to this preview-only lexical binding.
// Production pages keep the native Storage object, even on the same Pages origin.
const localStorage=window.__wdPreviewStorage;
(()=>{
  const realFetch=window.fetch.bind(window);
  const project='https://dohelzkgruxnmejmplgw.supabase.co';
  window.fetch=(input,init)=>{
    let url,method;
    try{url=new URL(typeof input==='string'?input:input.url,window.location.href);
      method=String(init?.method||(typeof input==='object'&&input.method)||'GET').toUpperCase()
    }catch{return realFetch(input,init)}
    if(url.origin===project&&!['GET','HEAD','OPTIONS'].includes(method)){
      const path=url.pathname;
      const allowAuth=path.startsWith('/auth/v1/');
      const allowRole=method==='POST'&&path==='/rest/v1/rpc/is_report_moderator';
      const allowPhoto=method==='POST'&&path.startsWith('/storage/v1/object/sign/');
      if(!allowAuth&&!allowRole&&!allowPhoto){
        return Promise.resolve(new Response(JSON.stringify({message:'Deze proefversie is alleen-lezen.',code:'PREVIEW_READ_ONLY'}),{
          status:403,headers:{'Content-Type':'application/json'}
        }));
      }
    }
    return realFetch(input,init)
  };
  function label(){
    if(document.getElementById('wdPreviewBanner'))return;
    const banner=document.createElement('div');banner.id='wdPreviewBanner';banner.setAttribute('role','status');
    banner.textContent='PROEFVERSIE · Alleen lezen · De huidige app blijft ongewijzigd';
    banner.style.cssText='position:sticky;top:0;z-index:99999;background:#173d35;color:#fffdf8;padding:10px 14px;text-align:center;font:700 13px system-ui;box-shadow:0 2px 8px #0002';
    document.body.prepend(banner);
    const style=document.createElement('style');
    style.textContent='body:has(#wdPreviewBanner) #reportFab,body:has(#wdPreviewBanner) #homeReport,body:has(#wdPreviewBanner) #mapPlusBtn,body:has(#wdPreviewBanner) #wdAccountSigned .outline-btn{touch-action:manipulation}';
    document.head.append(style);
    document.addEventListener('click',e=>{
      const button=e.target.closest('#reportFab,#homeReport,#mapPlusBtn,#publishReport,#resolveReport,#deleteReport');
      if(!button)return;
      e.preventDefault();e.stopImmediatePropagation();
      const toast=document.getElementById('toast');if(toast){toast.textContent='Proefversie: wijzigingen zijn uitgeschakeld.';toast.classList.add('show')}
    },true);
    document.addEventListener('submit',e=>{
      if(e.target?.id==='reportForm'){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',label,{once:true});else label();
})();

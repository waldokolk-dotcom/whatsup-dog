/* Isolated HTTPS feature preview. Loaded before app scripts; production data stays unchanged. */
'use strict';
window.__WD_PREVIEW__=true;
window.__wdPreviewStorage=(()=>{
  // Safari private mode and restricted webviews may deny Storage access. Keep the preview usable in memory.
  const memory=new Map(),prefix='wd-preview-';
  let real;
  try{real=window.localStorage;const probe=prefix+'storage-probe';real.setItem(probe,'1');real.removeItem(probe)}catch{real=null}
  const read=key=>memory.has(key)?memory.get(key):(real?real.getItem(key):null);
  const write=(key,value)=>{if(real){try{real.setItem(key,value);memory.delete(key);return}catch{real=null}}memory.set(key,value)};
  const remove=key=>{if(real){try{real.removeItem(key)}catch{real=null}}memory.delete(key)};
  const keys=()=>Array.from(new Set([...(real?Object.keys(real):[]),...memory.keys()]));
  const namespaced=key=>prefix+String(key);
  return Object.freeze({
    getItem:key=>read(namespaced(key)),
    setItem:(key,value)=>write(namespaced(key),String(value)),
    removeItem:key=>remove(namespaced(key)),
    clear:()=>{for(const key of keys())if(key.startsWith(prefix))remove(key)},
    key:index=>keys().filter(key=>key.startsWith(prefix))[index]?.slice(prefix.length)??null,
    get length(){return keys().filter(key=>key.startsWith(prefix)).length}
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
      // Signed-upload requests can grant write access; never issue them from a read-only preview.
      if(!allowAuth&&!allowRole){
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
    banner.textContent='PROEFVERSIE · Bekijk de kaart en meldingen. Publiceren is hier uitgeschakeld; de bestaande app blijft ongewijzigd.';
    banner.style.cssText='position:relative;z-index:2;background:#173d35;color:#fffdf8;padding:calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;text-align:center;font:700 12px/1.35 system-ui;box-sizing:border-box';
    document.body.prepend(banner);
    const style=document.createElement('style');
    style.textContent='body:has(#wdPreviewBanner) #reportFab,body:has(#wdPreviewBanner) #homeReport,body:has(#wdPreviewBanner) #mapPlusBtn,body:has(#wdPreviewBanner) #wdAccountSigned .outline-btn{touch-action:manipulation}';
    document.head.append(style);
    document.addEventListener('click',e=>{
      const button=e.target.closest('#publishReport,#resolveReport,#deleteReport');
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

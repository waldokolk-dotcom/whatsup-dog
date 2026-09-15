(()=>{
  const release={version:'1.8.0',name:'Dog, cat & both foundation',date:'2026-09-15'};
  window.WHATSUP_DOG_RELEASE=Object.freeze(release);
  function render(){
    document.documentElement.dataset.appVersion=release.version;
    document.querySelectorAll('.page-brand p').forEach(p=>{
      if(/Lokaal\s*·\s*Vriendelijk\s*·\s*Betrouwbaar/.test(p.textContent||'')){
        p.textContent=`Lokaal · Vriendelijk · Betrouwbaar · v${release.version}`;
      }
    });
    const profile=document.querySelector('#view-profile .settings-card.compact');
    if(profile&&!document.getElementById('appVersionRow')){
      const row=document.createElement('div');row.id='appVersionRow';row.className='data-row';row.innerHTML=`<span>Appversie</span><b>v${release.version}</b>`;profile.appendChild(row);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();

(()=>{
  const PHOTO_KEY='wd_profile_photo_v1';
  const EXTRA_AVATARS=['🐶','🐕','🦮','🐩','🐕‍🦺','🐾','🦴','🎾','💚','❤️','🧡','💛','💙','💜','🤎','🤍','🖤','🌿','🌳','🏖️','🥾','🌞','⭐','🏡'];

  function injectStyles(){
    if(document.getElementById('wd-profile-ui-style'))return;
    const s=document.createElement('style');s.id='wd-profile-ui-style';s.textContent=`
      #mapPlusBtn{display:none!important}
      .map-actions{position:absolute!important;right:16px!important;bottom:174px!important;z-index:520!important;display:grid!important;gap:10px!important}
      .map-actions .map-fab{position:static!important;right:auto!important;bottom:auto!important}
      .leaflet-bottom.leaflet-right{right:16px!important;bottom:286px!important}
      .leaflet-bottom.leaflet-right .leaflet-control{margin:0!important}
      .leaflet-control-zoom{border:0!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 8px 22px rgba(45,30,20,.18)!important}
      .leaflet-control-zoom a{width:42px!important;height:42px!important;line-height:40px!important;font-size:24px!important;border-color:rgba(59,36,24,.12)!important;color:#3b2418!important}
      .avatar-grid{grid-template-columns:repeat(6,minmax(52px,1fr))!important;gap:10px!important;max-height:220px;overflow:auto;padding:4px 2px 8px;scrollbar-width:thin}
      .avatar-choice,.photo-avatar-choice{min-width:0;aspect-ratio:1;border-radius:50%!important;display:grid;place-items:center;position:relative}
      .avatar-choice{font-size:30px!important}
      .photo-avatar-choice{border:2px dashed rgba(59,36,24,.28);background:#fff;color:#3b2418;cursor:pointer;text-align:center;font-weight:900;font-size:11px;padding:4px}
      .photo-avatar-choice span{font-size:25px;display:block;line-height:1;margin-bottom:2px}
      .photo-avatar-choice input{display:none}
      .wd-profile-photo{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}
      .profile-avatar-big.wd-has-photo,.home-avatar.wd-has-photo,.avatar-btn.wd-has-photo{overflow:hidden;padding:0!important}
      #homeAvatar.wd-has-photo,#profileQuickAvatar.wd-has-photo,#navProfileAvatar.wd-has-photo{width:100%;height:100%;display:block;border-radius:50%;overflow:hidden}
      #navProfileAvatar.wd-has-photo{width:30px;height:30px;margin:auto}
      @media(max-width:560px){.avatar-grid{grid-template-columns:repeat(5,minmax(50px,1fr))!important}.leaflet-bottom.leaflet-right{right:12px!important;bottom:280px!important}.map-actions{right:12px!important}}
    `;document.head.appendChild(s);
  }

  function removeDuplicateReportButton(){document.getElementById('mapPlusBtn')?.remove()}
  function photoData(){try{return localStorage.getItem(PHOTO_KEY)||''}catch{return''}}
  function savePhoto(data){try{if(data)localStorage.setItem(PHOTO_KEY,data);else localStorage.removeItem(PHOTO_KEY)}catch(err){console.warn('Profielfoto kon niet lokaal worden opgeslagen',err)}}
  function makeImg(src){const img=document.createElement('img');img.src=src;img.alt='Foto van je hond';img.className='wd-profile-photo';return img}

  function renderProfilePhoto(){
    const src=photoData();
    const ids=['profileAvatarBig','homeAvatar','profileQuickAvatar','navProfileAvatar'];
    ids.forEach(id=>{
      const node=document.getElementById(id);if(!node)return;
      const host=id==='homeAvatar'?node.closest('.home-avatar'):id==='profileQuickAvatar'?node.closest('.avatar-btn'):node;
      if(!src){node.classList.remove('wd-has-photo');host?.classList.remove('wd-has-photo');return}
      node.innerHTML='';node.appendChild(makeImg(src));node.classList.add('wd-has-photo');host?.classList.add('wd-has-photo');
    });
  }

  async function cropPhoto(file){
    if(!file?.type?.startsWith('image/'))throw new Error('Kies een afbeelding');
    if(file.size>12*1024*1024)throw new Error('Kies een foto kleiner dan 12 MB');
    const url=URL.createObjectURL(file);
    try{
      const img=new Image();img.decoding='async';await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
      const size=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-size)/2,sy=(img.naturalHeight-size)/2;
      const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,256,256);ctx.drawImage(img,sx,sy,size,size,0,0,256,256);
      return c.toDataURL('image/jpeg',.76);
    }finally{URL.revokeObjectURL(url)}
  }

  function enrichAvatarGrid(){
    const grid=document.getElementById('avatarGrid');if(!grid||grid.dataset.wdEnhanced==='1')return;
    grid.dataset.wdEnhanced='1';
    const existing=new Set([...grid.querySelectorAll('[data-avatar]')].map(x=>x.dataset.avatar));
    EXTRA_AVATARS.forEach(a=>{
      if(existing.has(a))return;
      const b=document.createElement('button');b.type='button';b.className='avatar-choice';b.dataset.avatar=a;b.setAttribute('aria-label',`Avatar ${a}`);b.textContent=a;grid.appendChild(b);
    });
    const label=document.createElement('label');label.className='photo-avatar-choice';label.innerHTML='<span>📷</span>Eigen foto<input id="dogProfilePhotoInput" type="file" accept="image/*">';grid.appendChild(label);
    label.querySelector('input').addEventListener('change',async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try{const data=await cropPhoto(f);savePhoto(data);renderProfilePhoto();document.querySelectorAll('.avatar-choice').forEach(x=>x.classList.remove('selected'));if(typeof toast==='function')toast('📷 Foto van je hond ingesteld')}catch(err){if(typeof toast==='function')toast(err.message||'Foto kon niet worden gebruikt')}finally{e.target.value=''}
    });
    grid.addEventListener('click',e=>{if(e.target.closest?.('[data-avatar]')){savePhoto('');setTimeout(renderProfilePhoto,0)}},true);
  }

  function patchProfileRefresh(){
    try{
      if(typeof updateProfileUI==='function'&&!updateProfileUI.__wdPhotoWrapped){
        const base=updateProfileUI;
        const wrapped=function(){base();renderProfilePhoto();};wrapped.__wdPhotoWrapped=true;updateProfileUI=wrapped;
      }
    }catch{}
  }

  function loadDirectoryUi(){
    if(document.querySelector('script[data-wd-directory-ui]'))return;
    const s=document.createElement('script');s.src='./directory-ui.js?v=1';s.async=false;s.dataset.wdDirectoryUi='1';document.body.appendChild(s);
  }

  function boot(){
    injectStyles();removeDuplicateReportButton();enrichAvatarGrid();patchProfileRefresh();renderProfilePhoto();loadDirectoryUi();
    document.addEventListener('click',()=>setTimeout(()=>{enrichAvatarGrid();renderProfilePhoto()},0));
    window.addEventListener('storage',e=>{if(e.key===PHOTO_KEY)renderProfilePhoto()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();

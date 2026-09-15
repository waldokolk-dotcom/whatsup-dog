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
      .feedback-card{margin-top:14px;padding:14px;border:1px solid rgba(59,36,24,.12);border-radius:18px;background:#fff}.feedback-card b{display:block;margin-bottom:3px}.feedback-card p{margin:0 0 10px;color:#71655c;font-size:12px;line-height:1.45}.feedback-card button{width:100%;min-height:46px}
      #feedbackDialog .feedback-sheet{max-width:560px}.feedback-options{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 14px}.feedback-options label{position:relative}.feedback-options input{position:absolute;opacity:0;pointer-events:none}.feedback-options span{min-height:44px;padding:8px;border:1.5px solid #d9cfc2;border-radius:12px;display:grid;place-items:center;background:#fff;font-weight:900;font-size:12px;text-align:center}.feedback-options input:checked+span{background:#3b2418;color:#fff;border-color:#3b2418}.feedback-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.feedback-note{font-size:11px;line-height:1.4;color:#71655c;margin-top:10px}
      @media(max-width:560px){.avatar-grid{grid-template-columns:repeat(5,minmax(50px,1fr))!important}.leaflet-bottom.leaflet-right{right:12px!important;bottom:280px!important}.map-actions{right:12px!important}.feedback-options{grid-template-columns:1fr}.feedback-actions{grid-template-columns:1fr}}
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
    const s=document.createElement('script');s.src='./directory-ui.js?v=1.8.1';s.async=false;s.dataset.wdDirectoryUi='1';document.body.appendChild(s);
  }

  function injectFeedback(){
    const view=document.getElementById('view-profile');if(!view||document.getElementById('feedbackCard'))return;
    const card=document.createElement('section');card.id='feedbackCard';card.className='feedback-card';card.innerHTML='<b>💬 Help Whatsup dog beter maken</b><p>Zie je een fout, is iets onduidelijk of mis je een functie? Deel het direct.</p><button id="openFeedback" type="button" class="primary">Geef feedback</button>';
    view.appendChild(card);
    const dlg=document.createElement('dialog');dlg.id='feedbackDialog';dlg.className='sheet-dialog';dlg.innerHTML=`<form id="feedbackForm" class="sheet-card feedback-sheet"><button type="button" class="dialog-close" data-close-dialog aria-label="Sluiten">×</button><div class="sheet-paw">💬</div><h2>Geef feedback</h2><p>Wat wil je ons laten weten?</p><div class="feedback-options"><label><input type="radio" name="feedbackType" value="Bug" required><span>🐞 Iets werkt niet</span></label><label><input type="radio" name="feedbackType" value="Onduidelijk" required><span>❓ Iets is onduidelijk</span></label><label><input type="radio" name="feedbackType" value="Wens" required><span>💡 Ik mis iets</span></label></div><label class="field"><span>Jouw feedback</span><textarea id="feedbackText" rows="5" maxlength="1200" placeholder="Beschrijf kort wat je zag, verwachtte of graag anders wilt." required></textarea></label><div class="feedback-actions"><button id="shareFeedback" type="submit" class="primary">Delen</button><button id="copyFeedback" type="button" class="outline-btn">Kopiëren</button></div><p class="feedback-note">We voegen alleen het app-versienummer en type apparaat/browser toe. Geen GPS, e-mail of exacte locatie.</p></form>`;
    document.body.appendChild(dlg);
    document.getElementById('openFeedback').addEventListener('click',()=>dlg.showModal());
    const build=()=>{const type=document.querySelector('input[name="feedbackType"]:checked')?.value||'Feedback';const text=document.getElementById('feedbackText')?.value.trim()||'';const version=window.WHATSUP_DOG_RELEASE?.version||'onbekend';return `Whatsup dog feedback\nType: ${type}\nVersie: ${version}\nApparaat/browser: ${navigator.userAgent}\n\n${text}`};
    document.getElementById('copyFeedback').addEventListener('click',async()=>{const text=build();if(!document.getElementById('feedbackText').value.trim()){window.toast?.('Schrijf eerst je feedback');return}try{await navigator.clipboard.writeText(text);window.toast?.('Feedback gekopieerd')}catch{window.toast?.('Kopiëren lukte niet')}});
    document.getElementById('feedbackForm').addEventListener('submit',async e=>{e.preventDefault();const text=build();if(!document.getElementById('feedbackText').value.trim())return;try{if(navigator.share){await navigator.share({title:'Feedback op Whatsup dog',text});window.toast?.('Dankjewel voor je feedback 🐾');dlg.close();e.target.reset();return}}catch(err){if(err?.name==='AbortError')return;console.warn(err)}try{await navigator.clipboard.writeText(text);window.toast?.('Feedback gekopieerd — stuur hem via WhatsApp of e-mail')}catch{window.toast?.('Delen lukt niet op dit apparaat')}});
  }

  function boot(){
    injectStyles();removeDuplicateReportButton();enrichAvatarGrid();patchProfileRefresh();renderProfilePhoto();loadDirectoryUi();injectFeedback();
    document.addEventListener('click',()=>setTimeout(()=>{enrichAvatarGrid();renderProfilePhoto()},0));
    window.addEventListener('storage',e=>{if(e.key===PHOTO_KEY)renderProfilePhoto()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();

(()=>{
'use strict';
// One tap-only navigation wheel; reporting keeps its existing form adapter.
const paths={
 paw:'<ellipse cx="7" cy="7" rx="2" ry="3"/><ellipse cx="17" cy="7" rx="2" ry="3"/><ellipse cx="3.5" cy="12" rx="1.8" ry="2.5"/><ellipse cx="20.5" cy="12" rx="1.8" ry="2.5"/><path d="M6 19c0-3 3-7 6-7s6 4 6 7c0 3-4 1-6 1s-6 2-6-1Z"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z"/><path d="M8 10h8M8 14h5"/>',
 profile:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 danger:'<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
 heart:'<path d="M12 21 3 12C-3 5 7-1 12 6c5-7 15-1 9 6Z"/>',
 dog:'<path d="m6 8-4 4V4l6 2h8l6-2v8l-4-4v9c0 6-12 6-12 0V8Z"/><path d="M9 12h.01M15 12h.01m-4 4h2l-1 2Z"/>',
 cat:'<path d="M4 12V3l6 4h4l6-4v9c4 12-20 12-16 0Z"/><path d="M8 12h.01M16 12h.01m-5 4h2M2 16h5m10 0h5"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
const options=[['danger','Gevaar','danger'],['fun','Leuk','heart'],['spotted-dog','Hond','dog'],['spotted-cat','Kat','cat'],['lost','Vermist','search'],['other','Overig','more']];
const dangerOptions=[['vegetation','Vegetatie'],['glass','Glas'],['poison','Gif'],['traffic','Verkeer'],['other-danger','Anders']];
const otherOptions=[['dirty','Poep'],['trash','Afval'],['other-detail','Anders']];
let focusBefore=null,dispatching=false;
const overlay=document.createElement('dialog');overlay.id='wdQuickWheel';overlay.className='wd-quick-wheel';overlay.setAttribute('aria-labelledby','wdWheelTitle');
overlay.innerHTML='<section class="wd-wheel-panel"><div class="wd-wheel-top"><div><small>SAMEN OP PAD</small><h2 id="wdWheelTitle">Waar wil je naartoe?</h2></div><button class="wd-wheel-close" type="button" aria-label="Sluiten"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="wd-paw-orbit" role="group" aria-label="Snelle navigatie"></div><div class="wd-wheel-disc" role="group" aria-label="Meldingstype" hidden></div><div id="wdWheelSub" class="wd-wheel-sub" hidden><h3 id="wdWheelSubTitle"></h3><div id="wdWheelDangerOptions"></div></div><p class="wd-wheel-hint">Alles dichtbij. Tik om te openen.</p><button type="button" id="wdWheelBack" hidden>← Terug</button></section>';
const orbit=overlay.querySelector('.wd-paw-orbit'),disc=overlay.querySelector('.wd-wheel-disc'),sub=overlay.querySelector('#wdWheelSub'),back=overlay.querySelector('#wdWheelBack'),title=overlay.querySelector('h2'),hint=overlay.querySelector('.wd-wheel-hint');
for(const [view,label,glyph] of [['map','Kaart','map'],['report','Melden','plus'],['chat','Chats','chat'],['profile','Profiel','profile'],['alerts','Meldingen','paw']]){
 const button=document.createElement('button');button.type='button';button.dataset.pawView=view;button.className='wd-paw-choice';button.innerHTML=icon(glyph)+'<span>'+label+'</span>';
 button.addEventListener('click',()=>{if(view==='report'){reports();return}close();document.querySelector(view==='alerts'?'#homeToAlerts':'.bottom-nav [data-view="'+view+'"]')?.click()});orbit.append(button);
}
for(const [id,label,glyph] of options){const b=document.createElement('button');b.type='button';b.dataset.quickType=id;b.className='wd-wheel-sector';b.innerHTML=icon(glyph)+'<span>'+label+'</span>';b.addEventListener('click',()=>id==='danger'||id==='other'?showSub(id):choose(id));disc.append(b)}
for(const [id,label] of [...dangerOptions,...otherOptions]){const b=document.createElement('button');b.type='button';b.dataset.dangerType=id;b.className='wd-wheel-danger';b.textContent=label;b.addEventListener('click',()=>choose(id));sub.querySelector('#wdWheelDangerOptions').append(b)}
const fab=document.createElement('button');fab.type='button';fab.id='wdQuickReport';fab.className='wd-quick-report';fab.setAttribute('aria-label','PawWheel openen');fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-expanded','false');fab.setAttribute('aria-controls',overlay.id);fab.innerHTML=icon('paw');
document.body.append(overlay,fab);
function home(){orbit.hidden=false;disc.hidden=true;sub.hidden=true;back.hidden=true;title.textContent='Waar wil je naartoe?';hint.textContent='Alles dichtbij. Tik om te openen.'}
function show(report=false){if(overlay.open)return;focusBefore=document.activeElement;home();overlay.showModal();document.body.classList.add('wd-wheel-open');fab.setAttribute('aria-expanded','true');if(report)reports();else orbit.querySelector('button').focus()}
function close(){if(!overlay.open)return;overlay.close();document.body.classList.remove('wd-wheel-open');fab.setAttribute('aria-expanded','false');if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true})}
function reports(){orbit.hidden=true;disc.hidden=false;sub.hidden=true;back.hidden=false;title.textContent='Wat wil je melden?';hint.textContent='Kies wat je onderweg ziet.';disc.querySelector('button').focus()}
function showSub(kind){disc.hidden=true;sub.hidden=false;title.textContent=kind==='danger'?'Welk gevaar?':'Wat wil je melden?';sub.querySelector('#wdWheelSubTitle').textContent=kind==='danger'?'Gevaar':'Overig';sub.querySelectorAll('[data-danger-type]').forEach(b=>b.hidden=!(kind==='danger'?dangerOptions:otherOptions).some(o=>o[0]===b.dataset.dangerType));sub.querySelector('button:not([hidden])').focus()}
function choose(id){
 close();
 const target=id==='vegetation'?'vegetation':id==='other-danger'||id==='glass'||id==='poison'||id==='traffic'?'danger':id==='trash'||id==='other-detail'?'other':id.startsWith('spotted-')?'spotted':id;
 const launcher=document.getElementById('mapPlusBtn')||document.getElementById('reportFab');
 if(!launcher)return;
 dispatching=true;try{launcher.click()}finally{dispatching=false}
 document.querySelector('#reportTypes [data-report-type="'+target+'"]')?.click();
 const species=id==='spotted-cat'?'cat':id==='spotted-dog'?'dog':null;
 if(species){const radio=document.querySelector('#reportAudience input[value="'+species+'"]');if(radio)radio.checked=true}
 if(id==='vegetation')selectedVegetation='Anders';
 const detail={'glass':'Glas','poison':'Mogelijk gif','traffic':'Verkeer','other-danger':'Ander gevaar','trash':'Zwerfafval','other-detail':'Overig'}[id]||null;
 if(detail)selectedVegetation=detail;
 if(detail&&document.getElementById('reportText')&&!document.getElementById('reportText').value)document.getElementById('reportText').value=detail;
 setTimeout(()=>document.dispatchEvent(new CustomEvent('wd:quick-report-start',{detail:{type:target,species,detail}})),90);
}

fab.addEventListener('click',()=>show());
overlay.querySelector('.wd-wheel-close').addEventListener('click',close);
back.addEventListener('click',()=>{if(!sub.hidden)reports();else{home();orbit.querySelector('[data-paw-view="report"]').focus()}});
overlay.addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const buttons=[...overlay.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);
 const index=buttons.indexOf(document.activeElement);
 if(event.shiftKey&&index<=0){event.preventDefault();buttons.at(-1)?.focus()}
 else if(!event.shiftKey&&index===buttons.length-1){event.preventDefault();buttons[0]?.focus()}
});
overlay.addEventListener('cancel',event=>{event.preventDefault();close()});
overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
document.addEventListener('click',event=>{if(dispatching)return;const trigger=event.target.closest('#homeReport,#reportFab,#mapPlusBtn');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();show(true)},true);
})();

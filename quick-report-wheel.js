(()=>{
'use strict';
const options=[
 ['danger','Gevaar','⚠️'],['dirty','Poep','💩'],['spotted-dog','Hond','🐕'],
 ['spotted-cat','Kat','🐈'],['lost','Vermist','🔎'],['other','Overig','★']
];
const dangerOptions=[['vegetation','Vegetatie','🌿'],['glass','Glas','🔷'],['poison','Gif','⚠️'],['traffic','Verkeer','🚗'],['other-danger','Anders','⋯']];
let open=false,focusBefore=null,dispatching=false;
const overlay=document.createElement('div');overlay.id='wdQuickWheel';overlay.className='wd-quick-wheel';overlay.hidden=true;
overlay.innerHTML='<section class="wd-wheel-panel" role="dialog" aria-modal="true" aria-labelledby="wdWheelTitle"><div class="wd-wheel-top"><h2 id="wdWheelTitle">Wat wil je melden?</h2><button class="wd-wheel-close" type="button" aria-label="Sluiten">×</button></div><div class="wd-wheel-disc" role="group" aria-label="Kies een meldcategorie"></div><div id="wdWheelSub" class="wd-wheel-sub" hidden><button type="button" id="wdWheelBack">← Terug</button><h3>Welk gevaar?</h3><div id="wdWheelDangerOptions"></div></div></section>';
const disc=overlay.querySelector('.wd-wheel-disc'),sub=overlay.querySelector('#wdWheelSub');
options.forEach(([id,label,emoji])=>{
 const b=document.createElement('button');b.type='button';b.dataset.quickType=id;b.className='wd-wheel-sector';
 const icon=document.createElement('span');icon.textContent=emoji;icon.setAttribute('aria-hidden','true');
 const name=document.createElement('b');name.textContent=label;b.append(icon,name);b.setAttribute('aria-label',label);
 b.addEventListener('click',()=>id==='danger'?showDanger():choose(id));
 disc.append(b);
});
dangerOptions.forEach(([id,label,emoji])=>{
 const b=document.createElement('button');b.type='button';b.dataset.dangerType=id;b.className='wd-wheel-danger';
 b.textContent=emoji+' '+label;b.addEventListener('click',()=>choose(id));sub.querySelector('#wdWheelDangerOptions').append(b);
});
const fab=document.createElement('button');fab.type='button';fab.id='wdQuickReport';fab.className='wd-quick-report';fab.textContent='🐾';fab.setAttribute('aria-label','Open meldwiel');
document.body.append(overlay,fab);
function show(){if(open)return;focusBefore=document.activeElement;open=true;overlay.hidden=false;sub.hidden=true;disc.hidden=false;document.body.classList.add('wd-wheel-open');disc.querySelector('button')?.focus({preventScroll:true})}
function close(){if(!open)return;open=false;overlay.hidden=true;document.body.classList.remove('wd-wheel-open');if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true})}
function showDanger(){disc.hidden=true;sub.hidden=false;sub.querySelector('button[data-danger-type]')?.focus({preventScroll:true})}
function choose(id){
 close();
 const target=id==='vegetation'?'vegetation':id==='other-danger'||id==='glass'||id==='poison'||id==='traffic'?'danger':id.startsWith('spotted-')?'spotted':id;
 const launcher=document.getElementById('mapPlusBtn')||document.getElementById('reportFab');
 if(!launcher)return;
 dispatching=true;try{launcher.click()}finally{dispatching=false}
 document.querySelector('#reportTypes [data-report-type="'+target+'"]')?.click();
 const species=id==='spotted-cat'?'cat':id==='spotted-dog'?'dog':null;
 if(species){const radio=document.querySelector('#reportAudience input[value="'+species+'"]');if(radio)radio.checked=true}
 if(id==='vegetation')selectedVegetation='Anders';
 const detail={'glass':'Glas','poison':'Mogelijk gif','traffic':'Verkeer','other-danger':'Ander gevaar'}[id]||null;
 if(detail)selectedVegetation=detail;
 if(detail&&document.getElementById('reportText')&&!document.getElementById('reportText').value)document.getElementById('reportText').value=detail;
 setTimeout(()=>document.dispatchEvent(new CustomEvent('wd:quick-report-start',{detail:{type:target,species,detail}})),90);
}
fab.addEventListener('click',show);overlay.querySelector('.wd-wheel-close').addEventListener('click',close);
overlay.querySelector('#wdWheelBack').addEventListener('click',()=>{disc.hidden=false;sub.hidden=true;disc.querySelector('button')?.focus()});
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
document.addEventListener('click',event=>{
 if(dispatching)return;const trigger=event.target.closest('#homeReport,#reportFab,#mapPlusBtn');if(!trigger)return;
 event.preventDefault();event.stopImmediatePropagation();show();
},true);
document.addEventListener('keydown',event=>{
 if(!open)return;if(event.key==='Escape'){event.preventDefault();if(!sub.hidden){disc.hidden=false;sub.hidden=true}else close();return}
 if(event.key!=='Tab')return;const buttons=[...overlay.querySelectorAll('button')].filter(b=>b.getClientRects().length);const i=buttons.indexOf(document.activeElement);
 if(event.shiftKey&&i===0){event.preventDefault();buttons.at(-1)?.focus()}else if(!event.shiftKey&&i===buttons.length-1){event.preventDefault();buttons[0]?.focus()}
});
})();

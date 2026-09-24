(()=>{
'use strict';
const options=[
 ['danger','Gevaar','⚠️'],['fun','Leuk','💚'],['spotted-dog','Hond','🐕'],
 ['spotted-cat','Kat','🐈'],['lost','Vermist','🔎'],['other','Overig','★']
];
const dangerOptions=[['vegetation','Vegetatie','🌿'],['glass','Glas','🔷'],['poison','Gif','⚠️'],['traffic','Verkeer','🚗'],['other-danger','Anders','⋯']];
const otherOptions=[['dirty','Poep','💩'],['trash','Afval','🗑️'],['other-detail','Anders','★']];
let open=false,focusBefore=null,dispatching=false,rotation=0,gesture=null,suppressFabClick=false,suppressDiscClick=false;
const overlay=document.createElement('div');overlay.id='wdQuickWheel';overlay.className='wd-quick-wheel';overlay.hidden=true;
overlay.innerHTML='<section class="wd-wheel-panel" role="dialog" aria-modal="true" aria-labelledby="wdWheelTitle"><div class="wd-wheel-top"><h2 id="wdWheelTitle">Wat wil je melden?</h2><button class="wd-wheel-close" type="button" aria-label="Sluiten">×</button></div><div class="wd-wheel-stage"><div class="wd-wheel-disc" role="group" tabindex="0" aria-label="Draai het meldwiel met één vinger of gebruik de pijltjestoetsen. Druk op Enter om te kiezen."></div><span class="wd-wheel-pointer" aria-hidden="true">◀</span></div><p class="wd-wheel-selection" id="wdWheelSelection" role="status" aria-live="polite">Draai of tik om te kiezen</p><div id="wdWheelSub" class="wd-wheel-sub" hidden><button type="button" id="wdWheelBack">← Terug</button><h3 id="wdWheelSubTitle">Welk gevaar?</h3><div id="wdWheelDangerOptions"></div></div></section>';
const disc=overlay.querySelector('.wd-wheel-disc'),sub=overlay.querySelector('#wdWheelSub');
options.forEach(([id,label,emoji])=>{
 const b=document.createElement('button');b.type='button';b.dataset.quickType=id;b.className='wd-wheel-sector';
 const content=document.createElement('span');content.className='wd-wheel-content';
 const icon=document.createElement('span');icon.className='wd-wheel-icon';icon.textContent=emoji;icon.setAttribute('aria-hidden','true');
 const name=document.createElement('b');name.textContent=label;content.append(icon,name);b.append(content);b.setAttribute('aria-label',label);
 b.addEventListener('click',()=>id==='danger'?showSub('danger'):id==='other'?showSub('other'):choose(id));
 disc.append(b);
});
dangerOptions.forEach(([id,label,emoji])=>{
 const b=document.createElement('button');b.type='button';b.dataset.dangerType=id;b.className='wd-wheel-danger';
 b.textContent=emoji+' '+label;b.addEventListener('click',()=>choose(id));sub.querySelector('#wdWheelDangerOptions').append(b);
});
otherOptions.forEach(([id,label,emoji])=>{const b=document.createElement('button');b.type='button';b.dataset.dangerType=id;b.className='wd-wheel-danger';b.textContent=emoji+' '+label;b.addEventListener('click',()=>choose(id));sub.querySelector('#wdWheelDangerOptions').append(b)});
const fab=document.createElement('button');fab.type='button';fab.id='wdQuickReport';fab.className='wd-quick-report';fab.setAttribute('aria-label','Open of draai meldwiel met één vinger');
const dockFace=document.createElement('span');dockFace.className='wd-dock-face';dockFace.setAttribute('aria-hidden','true');
options.forEach(([,label,emoji])=>{const part=document.createElement('span');part.className='wd-dock-sector';const content=document.createElement('span');content.className='wd-wheel-content';const icon=document.createElement('span');icon.className='wd-wheel-icon';icon.textContent=emoji;const name=document.createElement('b');name.textContent=label;content.append(icon,name);part.append(content);dockFace.append(part)});
const dockCenter=document.createElement('span');dockCenter.className='wd-dock-center';dockCenter.textContent='🐾';dockFace.append(dockCenter);fab.append(dockFace);
document.body.append(overlay,fab);
const mod=(n,m)=>((n%m)+m)%m;
const selectedIndex=()=>mod(Math.round((120-rotation)/60),options.length);
function paint(animate=false){
  const angle=rotation+'deg',counter=(-rotation)+'deg';
  for(const item of [disc,dockFace]){item.style.setProperty('--wd-angle',angle);item.style.setProperty('--wd-counter-angle',counter);item.classList.toggle('is-snapping',animate)}
  const option=options[selectedIndex()];
  overlay.querySelector('#wdWheelSelection').textContent=option[2]+' '+option[1]+' · loslaten om te kiezen';
}
function snap(){
  const index=selectedIndex();
  const base=120-index*60;
  rotation=base+360*Math.round((rotation-base)/360);
  paint(true);
  return options[index][0];
}
function show(){if(open)return;focusBefore=document.activeElement;open=true;overlay.hidden=false;sub.hidden=true;disc.hidden=false;document.body.classList.add('wd-wheel-open');paint(false);disc.focus({preventScroll:true})}
function close(){if(!open)return;open=false;overlay.hidden=true;document.body.classList.remove('wd-wheel-open');if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true})}
function pointerAngle(event,element){
  const rect=element.getBoundingClientRect(),x=event.clientX-(rect.left+rect.width/2),y=event.clientY-(rect.top+rect.height/2);
  return Math.atan2(y,x)*180/Math.PI;
}
function startSpin(event,element){
  if(event.button!==0||gesture)return;
  gesture={id:event.pointerId,element,last:pointerAngle(event,element),startX:event.clientX,startY:event.clientY,moved:false};
  element.setPointerCapture?.(event.pointerId);
}
function moveSpin(event){
  if(!gesture||event.pointerId!==gesture.id)return;
  const angle=pointerAngle(event,gesture.element);
  if(!gesture.moved&&Math.hypot(event.clientX-gesture.startX,event.clientY-gesture.startY)>=11)gesture.moved=true;
  if(gesture.moved){
    let change=angle-gesture.last;
    if(change>180)change-=360;if(change< -180)change+=360;
    rotation+=change;paint();
    event.preventDefault();
  }
  gesture.last=angle;
}
function endSpin(event){
  if(!gesture||event.pointerId!==gesture.id)return;
  const wasDock=gesture.element===fab,moved=gesture.moved;
  gesture=null;
  if(!moved)return;
  if(wasDock){suppressFabClick=true;setTimeout(()=>{suppressFabClick=false},0)}
  else{suppressDiscClick=true;setTimeout(()=>{suppressDiscClick=false},0)}
  const selected=snap();
  choose(selected);
}
function cancelSpin(){gesture=null}
function showSub(kind){disc.hidden=true;sub.hidden=false;sub.querySelector('#wdWheelSubTitle').textContent=kind==='danger'?'Welk gevaar?':'Wat wil je melden?';sub.querySelectorAll('[data-danger-type]').forEach(b=>b.hidden=kind==='danger'?otherOptions.some(o=>o[0]===b.dataset.dangerType):dangerOptions.some(o=>o[0]===b.dataset.dangerType));sub.querySelector('button[data-danger-type]:not([hidden])')?.focus({preventScroll:true})}
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
fab.addEventListener('click',event=>{if(suppressFabClick){event.preventDefault();return}show()});
for(const element of [fab,disc]){
 element.addEventListener('pointerdown',event=>startSpin(event,element));
 element.addEventListener('pointermove',moveSpin);
 element.addEventListener('pointerup',endSpin);
 element.addEventListener('pointercancel',cancelSpin);
 element.addEventListener('lostpointercapture',cancelSpin);
}
disc.addEventListener('click',event=>{if(suppressDiscClick){event.preventDefault();event.stopImmediatePropagation()}},true);
overlay.querySelector('.wd-wheel-close').addEventListener('click',close);
overlay.querySelector('#wdWheelBack').addEventListener('click',()=>{disc.hidden=false;sub.hidden=true;disc.querySelector('button')?.focus()});
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
document.addEventListener('click',event=>{
 if(dispatching)return;const trigger=event.target.closest('#homeReport,#reportFab,#mapPlusBtn');if(!trigger)return;
 event.preventDefault();event.stopImmediatePropagation();show();
},true);
document.addEventListener('keydown',event=>{
 if(!open)return;if(event.key==='Escape'){event.preventDefault();if(!sub.hidden){disc.hidden=false;sub.hidden=true}else close();return}
 if(!sub.hidden)return;
 if(event.target===disc&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){
  event.preventDefault();rotation+=event.key==='ArrowRight'?-60:60;snap();return;
 }
 if(event.target===disc&&(event.key==='Enter'||event.key===' ')){event.preventDefault();choose(snap());return}
 if(event.key!=='Tab')return;const buttons=[...overlay.querySelectorAll('button')].filter(b=>b.getClientRects().length);const i=buttons.indexOf(document.activeElement);
 if(event.shiftKey&&i===0){event.preventDefault();buttons.at(-1)?.focus()}else if(!event.shiftKey&&i===buttons.length-1){event.preventDefault();buttons[0]?.focus()}
});
paint();
})();

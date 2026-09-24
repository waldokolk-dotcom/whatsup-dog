(()=>{
'use strict';
const choices=[
 ['danger','Gevaar','❗'],['dirty','Poep / afval','💩'],
 ['spotted','Dier gezien','🐾'],['lost','Vermist dier','❤️'],
 ['vegetation','Vegetatie','🌿'],['fun','Leuke plek','★']
];
let opened=false,previousFocus=null,allowOriginal=false;
const backdrop=document.createElement('div');backdrop.id='wdQuickWheel';backdrop.className='wd-quick-wheel';backdrop.hidden=true;
backdrop.innerHTML='<div class="wd-wheel-panel" role="dialog" aria-modal="true" aria-labelledby="wdWheelTitle"><div class="wd-wheel-heading"><h2 id="wdWheelTitle">Wat wil je melden?</h2><p>Kies met je duim. Je locatie en tijd vullen we alvast in.</p></div><div class="wd-wheel-disc" role="group" aria-label="Snelle meldcategorieën"></div><button type="button" class="wd-wheel-close" aria-label="Sluit meldwiel">×</button></div>';
const disc=backdrop.querySelector('.wd-wheel-disc');
for(const [id,label,icon] of choices){
 const btn=document.createElement('button');btn.type='button';btn.className='wd-wheel-sector';btn.dataset.quickType=id;
 btn.innerHTML='<span aria-hidden="true">'+icon+'</span><b>'+label+'</b>';
 btn.setAttribute('aria-label',label);
 btn.addEventListener('click',()=>choose(id));
 disc.append(btn);
}
const hub=document.createElement('span');hub.className='wd-wheel-hub';hub.setAttribute('aria-hidden','true');hub.textContent='🐾';disc.append(hub);
const openButton=document.createElement('button');openButton.type='button';openButton.id='wdQuickReport';openButton.className='wd-quick-report';openButton.setAttribute('aria-label','Open meldwiel');openButton.textContent='🐾';
document.body.append(backdrop,openButton);
function open(){
 if(opened)return;
 previousFocus=document.activeElement;opened=true;backdrop.hidden=false;document.body.classList.add('wd-wheel-open');
 backdrop.querySelector('[data-quick-type="danger"]')?.focus({preventScroll:true});
}
function close(){
 if(!opened)return;
 opened=false;backdrop.hidden=true;document.body.classList.remove('wd-wheel-open');
 if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
function choose(id){
 close();
 const launcher=document.getElementById('mapPlusBtn')||document.getElementById('reportFab');
 if(!launcher)return;
 allowOriginal=true;
 try{launcher.click()}finally{allowOriginal=false}
 const category=document.querySelector('#reportTypes [data-report-type="'+id+'"]');
 category?.click();
 document.dispatchEvent(new CustomEvent('wd:quick-report-start',{detail:{type:id}}));
}
openButton.addEventListener('click',open);
backdrop.querySelector('.wd-wheel-close').addEventListener('click',close);
backdrop.addEventListener('click',event=>{if(event.target===backdrop)close()});
document.addEventListener('keydown',event=>{if(!opened)return;if(event.key==='Escape'){event.preventDefault();close()}if(event.key==='Tab'){const controls=[...backdrop.querySelectorAll('button')];const i=controls.indexOf(document.activeElement);if(event.shiftKey&&i===0){event.preventDefault();controls.at(-1).focus()}else if(!event.shiftKey&&i===controls.length-1){event.preventDefault();controls[0].focus()}}});
document.addEventListener('click',event=>{
 if(allowOriginal||window.__WD_PREVIEW__)return;
 const target=event.target.closest('#homeReport,#reportFab,#mapPlusBtn');
 if(!target)return;
 event.preventDefault();event.stopImmediatePropagation();open();
},true);
})();

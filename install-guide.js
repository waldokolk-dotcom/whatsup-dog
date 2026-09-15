(()=>{
  const appleSteps=[
    'Open Whatsup dog in Safari.',
    'Tik onderin op het vierkant met de pijl omhoog.',
    'Kies “Zet op beginscherm”.',
    'Tik op “Voeg toe”.'
  ];
  const otherSteps=[
    'Open Whatsup dog in je browser.',
    'Tik rechtsboven op de drie puntjes.',
    'Kies “Toevoegen aan startscherm” of “App installeren”.',
    'Tik op “Toevoegen” of “Installeren”.'
  ];
  const byId=id=>document.getElementById(id);
  function render(kind='apple'){
    const isApple=kind==='apple',steps=isApple?appleSteps:otherSteps;
    const list=byId('installSteps');if(list)list.innerHTML=steps.map(step=>`<li>${step}</li>`).join('');
    byId('installAppleTab')?.setAttribute('aria-selected',String(isApple));
    byId('installOtherTab')?.setAttribute('aria-selected',String(!isApple));
    if(byId('installTip'))byId('installTip').textContent=isApple?'Zie je “Zet op beginscherm” niet? Veeg in het menu iets naar beneden.':'De woorden kunnen per telefoon iets verschillen.';
  }
  function open(){render(/iPhone|iPad|iPod/i.test(navigator.userAgent)?'apple':'other');const dialog=byId('installHelpDialog');if(dialog&&!dialog.open)dialog.showModal()}
  function setup(){byId('installHelpButton')?.addEventListener('click',open);byId('installAppleTab')?.addEventListener('click',()=>render('apple'));byId('installOtherTab')?.addEventListener('click',()=>render('other'));render('apple')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

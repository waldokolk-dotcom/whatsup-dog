(()=>{
  'use strict';
  const preview=Boolean(window.__WD_PREVIEW__);
  const profile=document.getElementById('view-profile');
  if(!profile)return;
  const panel=document.createElement('section');
  panel.className='wd-account settings-card compact';panel.id='wdAccount';
  const heading=document.createElement('h2');heading.textContent='Mijn account';
  const description=document.createElement('p');description.textContent=preview?'Je bekijkt de proefversie. Accountregistratie en inloggen komen beschikbaar in de definitieve app.':'Bekijk buurtmeldingen zonder account. Maak gratis een account als je zelf wilt melden, gevonden wilt worden of wilt chatten.';
  const form=document.createElement('form');form.id='wdAccountLogin';form.autocomplete='on';
  const emailLabel=document.createElement('label');emailLabel.htmlFor='wdAccountEmail';emailLabel.textContent='E-mailadres';
  const email=document.createElement('input');email.id='wdAccountEmail';email.type='email';email.autocomplete='username';email.inputMode='email';email.required=true;email.maxLength=254;email.placeholder='naam@voorbeeld.nl';
  const passwordLabel=document.createElement('label');passwordLabel.htmlFor='wdAccountPassword';passwordLabel.textContent='Wachtwoord (alleen voor inloggen met wachtwoord)';
  const password=document.createElement('input');password.id='wdAccountPassword';password.type='password';password.autocomplete='current-password';password.maxLength=256;
  const actions=document.createElement('div');actions.className='wd-account-actions';
  const submit=document.createElement('button');submit.type='submit';submit.className='primary';submit.textContent='Inloggen met wachtwoord';
  const link=document.createElement('button');link.type='button';link.className='outline-btn';link.textContent='Mail mij een inloglink';
  const register=document.createElement('button');register.type='button';register.className='outline-btn';register.id='wdAccountRegister';register.textContent='Maak een gratis buurtaccount';
  actions.append(submit,link);form.append(emailLabel,email,passwordLabel,password,actions,register);
  const signed=document.createElement('div');signed.id='wdAccountSigned';signed.hidden=true;
  const signedText=document.createElement('p');const signOut=document.createElement('button');signOut.type='button';signOut.className='outline-btn';signOut.textContent='Uitloggen';
  signed.append(signedText,signOut);
  const status=document.createElement('p');status.id='wdAccountStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const previewNotice=document.createElement('p');previewNotice.id='wdAccountPreviewNotice';previewNotice.hidden=!preview;
  previewNotice.textContent='Je bekijkt de alleen-lezen proefversie. Aanmelden en accounts aanmaken zijn hier uitgeschakeld; vul hier geen e-mailadres of wachtwoord in. De accountfunctie wordt pas beschikbaar na de beveiligde praktijktest.';
  panel.append(heading,description,previewNotice,form,signed,status);
  profile.append(panel);
  let busy=false,linkCooldownUntil=0,cooldownTimer=null;
  function deferLink(){clearTimeout(cooldownTimer);cooldownTimer=setTimeout(()=>render(),Math.max(1000,linkCooldownUntil-Date.now()+100))}
  const client=()=>window.WhatsupDogCommunity?.client;
  function render(){
    const account=window.WhatsupDogCommunity;
    const user=account?.user;
    const verified=Boolean(user&&!user.is_anonymous);
    form.hidden=verified||preview;signed.hidden=!verified||preview;
    if(verified){signedText.textContent='Ingelogd als '+(user.email||'geverifieerd account');}
    if(preview){status.textContent='Proefversie: aanmelden is hier uitgeschakeld.';return;}
    if(!client()&&!busy)status.textContent=account?.status==='error'?'De accountverbinding is niet beschikbaar. Probeer het later opnieuw.':'De beveiligde verbinding wordt opgezet. Inloggen is nog niet beschikbaar.';
    submit.disabled=busy||!client();link.disabled=busy||!client()||Date.now()<linkCooldownUntil;register.disabled=busy||!client()||Date.now()<linkCooldownUntil||Boolean(window.__WD_PREVIEW__);signOut.disabled=busy;
  }
  const setBusy=value=>{busy=value;render()};
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(preview||busy||!client()||!form.reportValidity())return;
    if(!password.value){status.textContent='Vul je wachtwoord in, of gebruik de inloglink per e-mail.';password.focus();return}
    setBusy(true);status.textContent='Je account wordt gecontroleerd…';
    try{
      const {error}=await client().auth.signInWithPassword({email:email.value.trim(),password:password.value});
      if(error)throw error;
      password.value='';
      status.textContent='Ingelogd. Je onderhoudsrechten worden op de server gecontroleerd.';
      render();
    }catch(err){
      const message=String(err?.message||'').toLowerCase();
      password.value=password.value;
      status.textContent=message.includes('email not confirmed')||message.includes('email_not_confirmed')?'Bevestig eerst je e-mailadres via de bevestigingsmail en probeer daarna opnieuw.':message.includes('invalid login credentials')?'E-mailadres of wachtwoord klopt niet. Controleer beide velden.':'Inloggen is niet gelukt. Controleer je gegevens of gebruik de inloglink.';
      console.warn('Whatsup Dog accountlogin mislukt',err)
    }
    finally{setBusy(false)}
  });
  link.addEventListener('click',async()=>{
    if(Date.now()<linkCooldownUntil){status.textContent='Wacht nog even voordat je een nieuwe inloglink aanvraagt. Kijk eerst in je mailbox.';return}
    if(preview||busy||!client()||!email.checkValidity()){if(!preview)email.reportValidity();return}
    setBusy(true);status.textContent='Inloglink aanvragen…';
    try{
      const redirect=window.location.origin+window.location.pathname;
      const {error}=await client().auth.signInWithOtp({email:email.value.trim(),options:{shouldCreateUser:false,emailRedirectTo:redirect}});
      if(error)throw error;
      linkCooldownUntil=Date.now()+60000;deferLink();
      status.textContent='Als dit account bestaat, ontvang je een inloglink. Open die op hetzelfde apparaat. Controleer eventueel je spammap.';
    }catch(err){const limited=Number(err?.status)===429||/rate.?limit|after [0-9]+ seconds|too many/i.test(String(err?.message||''));if(limited){linkCooldownUntil=Date.now()+60000;deferLink()}status.textContent=limited?'Je hebt net een inloglink aangevraagd. Wacht minstens één minuut en kijk eerst in je mailbox.':'De inloglink kon niet worden verstuurd. Controleer je verbinding en probeer later opnieuw.';console.warn('Whatsup Dog inloglink mislukt',err)}
    finally{setBusy(false)}
  });
  register.addEventListener('click',()=>{
    if(preview)return;
    const create=document.getElementById('wdAccountCreate');
    if(!create)return;
    create.hidden=false;
    const signupEmail=document.getElementById('wdSignupEmail');
    if(signupEmail&&email.value.trim())signupEmail.value=email.value.trim();
    create.scrollIntoView({block:'start',behavior:'smooth'});
    signupEmail?.focus({preventScroll:true});
  });
  signOut.addEventListener('click',async()=>{
    if(busy||!client())return;
    setBusy(true);status.textContent='Uitloggen…';
    try{
      const {error}=await client().auth.signOut();if(error)throw error;
      status.textContent='Uitgelogd. Je kunt de buurt blijven bekijken.';
    }catch(err){status.textContent='Uitloggen lukte niet. Probeer het opnieuw.';console.warn('Whatsup Dog uitloggen mislukt',err)}
    finally{setBusy(false)}
  });
  document.addEventListener('wd:community-status',render);
  document.addEventListener('wd:auth-changed',render);
  render();
})();

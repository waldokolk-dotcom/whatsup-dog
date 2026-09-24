(()=>{
  'use strict';
  const profile=document.getElementById('view-profile');
  if(!profile)return;
  const panel=document.createElement('section');
  panel.className='wd-account settings-card compact';panel.id='wdAccount';
  const heading=document.createElement('h2');heading.textContent='Account en onderhoud';
  const description=document.createElement('p');description.textContent='Je kunt de buurt bekijken zonder in te loggen. Beheer is alleen beschikbaar voor een geverifieerd onderhoudsaccount.';
  const form=document.createElement('form');form.id='wdAccountLogin';form.autocomplete='on';
  const emailLabel=document.createElement('label');emailLabel.htmlFor='wdAccountEmail';emailLabel.textContent='E-mailadres';
  const email=document.createElement('input');email.id='wdAccountEmail';email.type='email';email.autocomplete='username';email.inputMode='email';email.required=true;email.maxLength=254;email.placeholder='naam@voorbeeld.nl';
  const passwordLabel=document.createElement('label');passwordLabel.htmlFor='wdAccountPassword';passwordLabel.textContent='Wachtwoord (alleen voor inloggen met wachtwoord)';
  const password=document.createElement('input');password.id='wdAccountPassword';password.type='password';password.autocomplete='current-password';password.maxLength=256;
  const actions=document.createElement('div');actions.className='wd-account-actions';
  const submit=document.createElement('button');submit.type='submit';submit.className='primary';submit.textContent='Inloggen met wachtwoord';
  const link=document.createElement('button');link.type='button';link.className='outline-btn';link.textContent='Mail mij een inloglink';
  actions.append(submit,link);form.append(emailLabel,email,passwordLabel,password,actions);
  const signed=document.createElement('div');signed.id='wdAccountSigned';signed.hidden=true;
  const signedText=document.createElement('p');const signOut=document.createElement('button');signOut.type='button';signOut.className='outline-btn';signOut.textContent='Uitloggen';
  signed.append(signedText,signOut);
  const status=document.createElement('p');status.id='wdAccountStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  panel.append(heading,description,form,signed,status);
  profile.append(panel);
  let busy=false;
  const client=()=>window.WhatsupDogCommunity?.client;
  function render(){
    const account=window.WhatsupDogCommunity;
    const user=account?.user;
    const verified=Boolean(user&&!user.is_anonymous);
    form.hidden=verified;signed.hidden=!verified;
    if(verified){signedText.textContent='Ingelogd als '+(user.email||'geverifieerd account');}
    if(!client()&&!busy)status.textContent='De beveiligde verbinding wordt opgezet. Inloggen is nog niet beschikbaar.';
    submit.disabled=busy||!client();link.disabled=busy||!client();signOut.disabled=busy;
  }
  const setBusy=value=>{busy=value;render()};
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy||!client()||!form.reportValidity())return;
    if(!password.value){status.textContent='Vul je wachtwoord in, of gebruik de inloglink per e-mail.';password.focus();return}
    setBusy(true);status.textContent='Je account wordt gecontroleerd…';
    try{
      const {error}=await client().auth.signInWithPassword({email:email.value.trim(),password:password.value});
      password.value='';
      if(error)throw error;
      status.textContent='Ingelogd. Je onderhoudsrechten worden op de server gecontroleerd.';
      render();
    }catch(err){password.value='';status.textContent='Inloggen is niet gelukt. Controleer je gegevens of gebruik de inloglink.';console.warn('Whatsup Dog accountlogin mislukt',err)}
    finally{setBusy(false)}
  });
  link.addEventListener('click',async()=>{
    if(busy||!client()||!email.checkValidity()){email.reportValidity();return}
    setBusy(true);status.textContent='Inloglink aanvragen…';
    try{
      const redirect=window.location.origin+window.location.pathname;
      const {error}=await client().auth.signInWithOtp({email:email.value.trim(),options:{shouldCreateUser:false,emailRedirectTo:redirect}});
      if(error)throw error;
      status.textContent='Als dit account bestaat, ontvang je een inloglink. Open die op hetzelfde apparaat. Controleer eventueel je spammap.';
    }catch(err){status.textContent='De inloglink kon niet worden verstuurd. Probeer later opnieuw.';console.warn('Whatsup Dog inloglink mislukt',err)}
    finally{setBusy(false)}
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

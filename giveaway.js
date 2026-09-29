(()=>{
'use strict';
const ROOT=document.querySelector('#app main');if(!ROOT)return;
const preview=()=>Boolean(window.__WD_PREVIEW__);
const backend=()=>window.WhatsupDogCommunity;
const client=()=>backend()?.client;
const member=()=>backend()?.user&&!backend().user.is_anonymous?backend().user:null;
const $=id=>document.getElementById(id);
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page=document.createElement('section');page.id='view-giveaway';page.className='view page-view wd-giveaway';page.setAttribute('aria-label','Gratis weggeef- en ruilhoek');
page.innerHTML=`<header class="page-brand"><div class="chat-logo" aria-hidden="true">🎁</div><div><h1>Weggeefhoek</h1><p>Gratis delen of ruilen. Geen verkoop, geen betalingen.</p></div></header>
<p class="wd-giveaway-note">Deel spullen voor hond of kat met buurtgenoten. Deel geen huisadres of telefoonnummer in je advertentie. Spreek veilig af via de chat.</p>
<div class="wd-giveaway-toolbar"><button type="button" id="wdGiveRefresh" class="outline-btn">Verversen</button><button type="button" id="wdGiveCreate" class="primary">＋ Geef iets weg</button></div>
<p id="wdGiveStatus" role="status" aria-live="polite"></p><div id="wdGiveList" class="wd-giveaway-list"></div>
<form id="wdGiveForm" class="wd-giveaway-form" hidden><h2>Nieuwe advertentie</h2>
<label>Wat geef je weg of ruil je?<input name="title" maxlength="90" minlength="3" required placeholder="Bijv. hondenmand"></label>
<label>Omschrijving<textarea name="description" maxlength="1000" minlength="5" required rows="3" placeholder="Staat, maat en bijzonderheden"></textarea></label>
<label>Voor wie?<select name="category"><option value="hond">Hond</option><option value="kat">Kat</option><option value="beide">Hond en kat</option></select></label>
<label>Wat wil je doen?<select name="kind"><option value="gratis">Gratis weggeven</option><option value="ruilen">Gratis ruilen</option></select></label>
<label>Woonplaats (geen adres)<input name="town" maxlength="80" minlength="2" required placeholder="Bijv. Nijkerk"></label>
<label>Foto (optioneel, maximaal 5 MB)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
<div class="wd-giveaway-toolbar"><button type="submit" class="primary">Plaatsen</button><button type="button" id="wdGiveCancel" class="outline-btn">Annuleren</button></div></form>`;
ROOT.append(page);
const nav=document.querySelector('.bottom-nav [data-view="feed"]');
if(nav){const b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.view='giveaway';b.innerHTML='<span aria-hidden="true">🎁</span><small>Weggeven</small>';nav.after(b);b.addEventListener('click',()=>{if(typeof showView==='function')showView('giveaway');load()})}
function status(s){$('wdGiveStatus').textContent=s}
function card(l){const e=document.createElement('article');e.className='wd-giveaway-card';
 e.innerHTML=`<div class="wd-giveaway-photo"></div><div><small>${l.kind==='ruilen'?'Ruilen':'Gratis'} · ${escape(l.category)} · ${escape(l.town)}</small><h2>${escape(l.title)}</h2><p>${escape(l.description)}</p><div class="wd-giveaway-toolbar"></div></div>`;
 const actions=e.querySelector('.wd-giveaway-toolbar');
 if(l.owner_id===member()?.id){const done=document.createElement('button');done.type='button';done.className='outline-btn';done.textContent='Markeer afgehandeld';done.addEventListener('click',()=>finish(l.id));actions.append(done)}
 else {const chat=document.createElement('button');chat.type='button';chat.className='outline-btn';chat.textContent='Contact via chat';chat.addEventListener('click',()=>{if(typeof showView==='function')showView('chat');const node=$('wdChatStatus');if(node)node.textContent='Zoek de aanbieder bij vindbare buurtgenoten. De aanbieder moet vindbaarheid zelf hebben aangezet.'});actions.append(chat)}
 if(l.image_path&&client()){client().storage.from('giveaway-photos').createSignedUrl(l.image_path,900).then(({data,error})=>{if(error||!data?.signedUrl)return;const img=document.createElement('img');img.alt='Foto van '+l.title;img.loading='lazy';img.src=data.signedUrl;e.querySelector('.wd-giveaway-photo').append(img)}).catch(()=>{})}
 return e}
async function load(){const list=$('wdGiveList');list.replaceChildren();if(!client()){status('De weggeefhoek is momenteel niet verbonden.');return}
 status('Advertenties laden…');try{const {data,error}=await client().from('giveaway_listings').select('id,owner_id,title,description,category,kind,town,image_path,status,created_at').order('created_at',{ascending:false}).limit(60);if(error)throw error;
 if(!data?.length){status('Nog geen spullen aangeboden.');return}status('');data.forEach(l=>list.append(card(l)))}catch(e){console.warn('Weggeefhoek ophalen mislukt',e);status('Advertenties ophalen lukt nu niet. Probeer later opnieuw.')}}
async function photoBlob(file){if(!file)return null;if(file.size>5242880)throw new Error('Foto is groter dan 5 MB');
 const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1400/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
 return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Foto kon niet worden verwerkt')),'image/jpeg',0.82))}
async function finish(id){if(!member()||preview())return;if(!confirm('Deze advertentie als afgehandeld markeren?'))return;const {error}=await client().from('giveaway_listings').update({status:'afgerond',updated_at:new Date().toISOString()}).eq('id',id).eq('owner_id',member().id);if(error){status('Afhandelen mislukt.');return}load()}
$('wdGiveCreate').addEventListener('click',()=>{if(preview()){status('Proefversie is alleen-lezen.');return}if(!member()){status('Log eerst in met een bevestigd account.');if(typeof showView==='function')showView('profile');return}const form=$('wdGiveForm');form.hidden=false;form.elements.town.value=(()=>{try{return JSON.parse(localStorage.getItem('wd_profile_v1')||'{}').homePlace||''}catch{return ''}})();form.scrollIntoView({block:'start'})});
$('wdGiveCancel').addEventListener('click',()=>{$('wdGiveForm').hidden=true});
$('wdGiveRefresh').addEventListener('click',load);
$('wdGiveForm').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;if(!member()||preview()||!form.reportValidity())return;const btn=form.querySelector('[type=submit]');btn.disabled=true;let path=null;
 try{const id=crypto.randomUUID(),file=form.elements.photo.files[0];if(file){const blob=await photoBlob(file);if(blob.size>5242880)throw new Error('Foto te groot na verwerking');path=member().id+'/'+id+'.jpg';const upload=await client().storage.from('giveaway-photos').upload(path,blob,{contentType:'image/jpeg',upsert:false});if(upload.error)throw upload.error}
 const row={id,owner_id:member().id,title:form.elements.title.value.trim(),description:form.elements.description.value.trim(),category:form.elements.category.value,kind:form.elements.kind.value,town:form.elements.town.value.trim(),image_path:path};
 const {error}=await client().from('giveaway_listings').insert(row);if(error)throw error;form.reset();form.hidden=true;status('Je advertentie is geplaatst.');await load()}
 catch(error){console.warn('Advertentie plaatsen mislukt',error);if(path)await client().storage.from('giveaway-photos').remove([path]).catch(()=>{});status('Plaatsen is niet gelukt. Je ingevulde gegevens zijn bewaard; probeer opnieuw.')}
 finally{btn.disabled=false}});
document.addEventListener('wd:auth-changed',()=>{if(page.classList.contains('active'))load()});
document.addEventListener('wd:community-status',()=>{if(page.classList.contains('active'))load()});
})();

(()=>{
'use strict';
const page=document.getElementById('view-chat');if(!page)return;
const $=id=>document.getElementById(id);
const isPreview=()=>Boolean(window.__WD_PREVIEW__);
const current=()=>window.WhatsupDogCommunity;
const user=()=>current()?.user;
const ready=()=>Boolean(current()?.client&&user()&&!user().is_anonymous);
let contacts=[],rooms=[],activeRoom=null,channel=null;
const node=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e};
const status=message=>{$('wdChatStatus').textContent=message};
function clearChannel(){if(channel&&current()?.client)current().client.removeChannel(channel);channel=null}
function renderGate(){
 const ok=ready();
 $('wdChatGate').hidden=ok;$('wdChatContent').hidden=!ok;
 if(!ok){clearChannel();activeRoom=null;status(current()?.client?'Log in met een geverifieerd account om privé- en groepschats te gebruiken.':'Verbinding met de buurt wordt opgezet…')}
 else if(isPreview())status('Proefversie: gesprekken bekijken kan, berichten sturen en groepen maken niet.');
 else status('Alleen de deelnemers kunnen deze gesprekken lezen.');
}
function roomName(room){
 if(room.name!=='Privégesprek')return room.name;
 const ids=room.members.filter(id=>id!==user()?.id);
 const other=contacts.find(p=>p.id===ids[0]);return other?.display_name||'Privégesprek';
}
async function loadContacts(){
 if(!ready())return;
 const {data,error}=await current().client.rpc('list_discoverable_profiles');
 if(error)throw error;contacts=Array.isArray(data)?data.filter(p=>p.id!==user()?.id):[];
}
async function loadRooms(){
 if(!ready())return;
 const client=current().client,me=user().id;
 const {data:members,error:memberError}=await client.from('chat_members').select('room_id').eq('user_id',me);
 if(memberError)throw memberError;
 const ids=(members||[]).map(m=>m.room_id);
 if(!ids.length){rooms=[];renderRooms();return}
 const [{data:rows,error:roomError},{data:participants,error:participantsError}]=await Promise.all([
   client.from('chat_rooms').select('id,name,created_at,created_by').in('id',ids).order('created_at',{ascending:false}),
   client.from('chat_members').select('room_id,user_id').in('room_id',ids)
 ]);
 if(roomError||participantsError)throw roomError||participantsError;
 rooms=(rows||[]).map(r=>({...r,members:(participants||[]).filter(m=>m.room_id===r.id).map(m=>m.user_id)}));
 renderRooms();
}
function renderRooms(){
 const list=$('wdChatRooms');list.replaceChildren();
 if(!rooms.length){list.append(node('p','wd-chat-empty','Nog geen gesprekken. Kies een vindbaar buurtgenootje om een privéchat te beginnen, of maak een groep.'));return}
 rooms.forEach(room=>{
  const b=node('button','wd-chat-room');b.type='button';
  b.append(node('span','wd-chat-room-icon',room.name==='Privégesprek'?'💬':'👥'));
  const details=node('span','wd-chat-room-info');details.append(node('b','',roomName(room)),node('small','',room.members.length+' deelnemers'));
  b.append(details,node('span','wd-chat-chevron','›'));b.addEventListener('click',()=>openRoom(room.id));list.append(b);
 });
}
function renderContacts(group=false){
 const wrap=$('wdChatContacts');wrap.replaceChildren();
 if(!contacts.length){wrap.append(node('p','wd-chat-empty','Nog niemand heeft het profiel vindbaar gemaakt. Je ziet hier uitsluitend mensen die daarvoor kiezen.'));return}
 contacts.forEach(person=>{
   const label=document.createElement('label');label.className='wd-chat-contact';
   const input=document.createElement('input');input.type=group?'checkbox':'radio';input.name='wdContact';input.value=person.id;
   const avatar=node('span','wd-chat-avatar',person.avatar||'🐾');
   const display=node('span','wd-chat-contact-name');display.append(node('b','',person.display_name||'Buurtgenoot'));
   if(person.home_place)display.append(node('small','',person.home_place));
   label.append(input,avatar,display);wrap.append(label);
 });
}
function showChooser(group=false){
 $('wdChatPicker').hidden=false;$('wdChatGroupNameWrap').hidden=!group;$('wdChatPickerTitle').textContent=group?'Nieuwe groep':'Nieuwe privéchat';
 $('wdChatStart').textContent=group?'Groep maken':'Gesprek openen';
 $('wdChatPicker').dataset.kind=group?'group':'private';
 renderContacts(group);$('wdChatGroupName').value='';
 $('wdChatPicker').scrollIntoView({block:'nearest',behavior:'smooth'});
}
async function createChat(event){
 event.preventDefault();
 if(!ready()||isPreview()){status('Deze proefversie is alleen-lezen. Chatten kan na de veilige productie-release.');return}
 const ids=[...$('wdChatContacts').querySelectorAll('input:checked')].map(x=>x.value),group=$('wdChatPicker').dataset.kind==='group';
 if(ids.length<(group?2:1)){status(group?'Kies minimaal twee deelnemers voor de groep.':'Kies één buurtgenoot.');return}
 const button=$('wdChatStart');button.disabled=true;
 try{
  const args=group?{group_name:$('wdChatGroupName').value.trim(),targets:ids}:{target:ids[0]};
  if(group&&!args.group_name){status('Geef de groep eerst een naam.');return}
  const {data,error}=await current().client.rpc(group?'start_group_chat':'start_private_chat',args);
  if(error)throw error;
  $('wdChatPicker').hidden=true;await loadRooms();await openRoom(data);
 }catch(err){console.warn('Gesprek starten mislukt',err);status('Gesprek starten lukte niet. Controleer of de deelnemers vindbaar zijn en probeer opnieuw.')}
 finally{button.disabled=false}
}
async function openRoom(id){
 const room=rooms.find(r=>r.id===id);if(!room||!ready())return;activeRoom=room;clearChannel();
 $('wdChatConversation').hidden=false;$('wdChatListView').hidden=true;$('wdChatPicker').hidden=true;
 $('wdChatTitle').textContent=roomName(room);$('wdChatParticipants').textContent=room.members.length+' deelnemers · alleen leden kunnen meelezen';
 $('wdChatSend').disabled=isPreview();$('wdChatInput').disabled=isPreview();
 await loadMessages();
 channel=current().client.channel('wd-chat-room-'+room.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:'room_id=eq.'+room.id},()=>loadMessages().catch(console.warn)).subscribe();
}
async function loadMessages(){
 if(!activeRoom||!ready())return;
 const room=activeRoom,client=current().client;
 const {data,error}=await client.from('chat_messages').select('id,user_id,body,created_at').eq('room_id',room.id).order('created_at',{ascending:true}).limit(200);
 if(error){status('Berichten ophalen lukt nu niet.');return}
 if(activeRoom?.id!==room.id)return;
 const box=$('wdChatMessages');box.replaceChildren();
 if(!data?.length){box.append(node('p','wd-chat-empty','Nog geen berichten in dit gesprek.'))}
 for(const msg of data||[]){
  const bubble=node('article','wd-chat-bubble'+(msg.user_id===user().id?' is-own':''));
  bubble.append(node('p','',msg.body),node('time','',new Date(msg.created_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})));
  box.append(bubble);
 }
 box.scrollTop=box.scrollHeight;
}
async function sendMessage(event){
 event.preventDefault();
 if(!activeRoom||!ready()||isPreview())return;
 const input=$('wdChatInput'),body=input.value.trim();
 if(!body)return;if(body.length>2000){status('Je bericht mag maximaal 2000 tekens zijn.');return}
 const button=$('wdChatSend');button.disabled=true;
 try{
  const {error}=await current().client.from('chat_messages').insert({room_id:activeRoom.id,user_id:user().id,body});
  if(error)throw error;input.value='';await loadMessages();
 }catch(err){console.warn('Chatbericht opslaan mislukt',err);status('Bericht versturen lukte niet. Je tekst is bewaard; probeer opnieuw.')}
 finally{button.disabled=false}
}
function exitRoom(){clearChannel();activeRoom=null;$('wdChatConversation').hidden=true;$('wdChatListView').hidden=false;loadRooms().catch(console.warn)}
async function refresh(){
 renderGate();if(!ready())return;
 try{await loadContacts();await loadRooms();if(activeRoom)await loadMessages()}
 catch(err){console.warn('Chat vernieuwen mislukt',err);status('Chats zijn tijdelijk niet beschikbaar. Probeer het opnieuw.')}
}
$('wdChatPrivate').addEventListener('click',()=>showChooser(false));
$('wdChatGroup').addEventListener('click',()=>showChooser(true));
$('wdChatCancel').addEventListener('click',()=>{$('wdChatPicker').hidden=true});
$('wdChatPicker').addEventListener('submit',createChat);
$('wdChatBack').addEventListener('click',exitRoom);
$('wdChatComposer').addEventListener('submit',sendMessage);
$('wdChatRefresh').addEventListener('click',refresh);
$('wdChatLogin').addEventListener('click',()=>{document.querySelector('.bottom-nav [data-view="profile"]')?.click();$('wdAccount')?.scrollIntoView({block:'start',behavior:'smooth'})});
document.addEventListener('wd:community-status',refresh);
document.addEventListener('wd:auth-changed',()=>{exitRoom();refresh()});
document.addEventListener('wd:directory-updated',()=>refresh());
renderGate();setTimeout(refresh,450);
})();

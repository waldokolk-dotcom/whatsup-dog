import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
// Disposable, LOCAL Supabase only. No production URL, no external Auth fixtures.
const s=JSON.parse(execFileSync('supabase',['status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const url=s.API_URL;
assert.match(url,/^http:\/\/(127\.0\.0\.1|localhost):54321$/,'Refusing chat E2E outside local Supabase');
const publicKey=s.ANON_KEY,adminKey=s.SERVICE_ROLE_KEY,run=randomBytes(5).toString('hex');
let checks=0;
async function call(path,token,method='GET',body,key=publicKey){
 const r=await fetch(url+path,{method,headers:{apikey:key,Authorization:'Bearer '+(token||key),...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{data=raw}
 return{r,data};
}
async function must(path,token,method='GET',body,key=publicKey){
 const v=await call(path,token,method,body,key);
 assert.ok(v.r.ok,method+' '+path+' '+v.r.status+' '+JSON.stringify(v.data));checks++;return v.data;
}
const users=[];
for(let i=0;i<4;i++){
 const email='wd-chat-'+run+'-'+i+'@example.test',password='Wd!'+randomBytes(22).toString('base64url');
 const u=await must('/auth/v1/admin/users',adminKey,'POST',{email,password,email_confirm:true},adminKey);
 const sign=await must('/auth/v1/token?grant_type=password',null,'POST',{email,password});
 assert.ok(u.id&&sign.access_token);checks++;
 users.push({id:u.id,token:sign.access_token});
}
const [a,b,c,outsider]=users;
for(let i=0;i<users.length;i++){
 const u=users[i];
 await must('/rest/v1/profiles',u.token,'POST',{id:u.id,display_name:'E2E '+i,avatar:'🐾',home_place:'Nijkerk'});
}
const before=await must('/rest/v1/rpc/list_discoverable_profiles',a.token,'POST',{});
assert.deepEqual(before,[],'Profiles should not be discoverable by default');checks++;
for(const u of [b,c]){
 const result=await must('/rest/v1/rpc/set_profile_discoverability',u.token,'POST',{enabled:true,profile_name:'Chat tester',profile_avatar:'🐾',profile_place:'Nijkerk',pet_breed:'Onbekend'});
 assert.equal(result,true);checks++;
}
const people=await must('/rest/v1/rpc/list_discoverable_profiles',a.token,'POST',{});
assert.deepEqual(people.map(p=>p.id).sort(),[b.id,c.id].sort());checks++;
for(const p of people)assert.ok(!('home_lat'in p||'email'in p),'Directory exposed private data');checks++;
const privateRoom=await must('/rest/v1/rpc/start_private_chat',a.token,'POST',{target:b.id});
assert.ok(privateRoom);checks++;
const sameRoom=await must('/rest/v1/rpc/start_private_chat',a.token,'POST',{target:b.id});
assert.equal(sameRoom,privateRoom,'Private conversation should be reused');checks++;
await must('/rest/v1/chat_messages',a.token,'POST',{room_id:privateRoom,user_id:a.id,body:'Hallo via een echte chat!'});
const received=await must('/rest/v1/chat_messages?room_id=eq.'+privateRoom+'&select=body',b.token);
assert.equal(received[0].body,'Hallo via een echte chat!');checks++;
const excluded=await must('/rest/v1/chat_messages?room_id=eq.'+privateRoom+'&select=body',outsider.token);
assert.deepEqual(excluded,[],'An outsider read a private conversation');checks++;
const intrusion=await call('/rest/v1/chat_messages',outsider.token,'POST',{room_id:privateRoom,user_id:outsider.id,body:'Intrusion'});
assert.equal(intrusion.r.status,403,'Outsider could write private chat');checks++;
const group=await must('/rest/v1/rpc/start_group_chat',a.token,'POST',{group_name:'Wandelen Nijkerk',targets:[b.id,c.id]});
await must('/rest/v1/chat_messages',c.token,'POST',{room_id:group,user_id:c.id,body:'Groepsbericht'});
const groupReceived=await must('/rest/v1/chat_messages?room_id=eq.'+group+'&select=body',b.token);
assert.equal(groupReceived[0].body,'Groepsbericht');checks++;
const noGroup=await must('/rest/v1/chat_messages?room_id=eq.'+group+'&select=body',outsider.token);
assert.deepEqual(noGroup,[],'Outsider read group chat');checks++;
const twoAccountGroup=await must('/rest/v1/rpc/start_group_chat',a.token,'POST',{group_name:'Samen wandelen',targets:[b.id]});
await must('/rest/v1/chat_messages',b.token,'POST',{room_id:twoAccountGroup,user_id:b.id,body:'Bericht in groep van twee'});
const twoAccountReceived=await must('/rest/v1/chat_messages?room_id=eq.'+twoAccountGroup+'&select=body',a.token);
assert.equal(twoAccountReceived[0].body,'Bericht in groep van twee');checks++;
const denied=await call('/rest/v1/rpc/start_private_chat',outsider.token,'POST',{target:a.id});
assert.equal(denied.r.status,403,'Non-discoverable target should not be open for private chat');checks++;
console.log('PASS '+checks+' verified local chat/opt-in/RLS assertions: private messages, group delivery, outsider denied');

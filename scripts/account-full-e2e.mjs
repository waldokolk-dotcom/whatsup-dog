import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';

// Destructive test identities are allowed only on ephemeral local Supabase.
const s=JSON.parse(execFileSync('supabase',['status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
assert.match(s.API_URL,/^http:\/\/(127\.0\.0\.1|localhost):54321$/,'Refuse nonlocal Auth tests');
const api=s.API_URL,key=s.ANON_KEY,admin=s.SERVICE_ROLE_KEY;
const inbox=new URL(s.INBUCKET_URL||'http://127.0.0.1:54324');
assert.ok(['127.0.0.1','localhost'].includes(inbox.hostname),'Refuse nonlocal mail inbox');
const seed=randomBytes(6).toString('hex');
let checks=0;
async function req(path,{token=null,k=key,method='GET',body}={}){
 const r=await fetch(api+path,{method,headers:{apikey:k,...(token?{Authorization:'Bearer '+token}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await r.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
 return{r,data};
}
async function must(path,options={}){
 const out=await req(path,options);
 assert.ok(out.r.ok,`${options.method||'GET'} ${path}: ${out.r.status} ${JSON.stringify(out.data)}`);checks++;return out.data;
}
async function emailToken(email,type){
 // Current Supabase CLI uses local Mailpit, not legacy Inbucket.
 let messages=[];
 for(let i=0;i<40;i++){
  const q=new URL('/api/v1/search',inbox);q.searchParams.set('query','to:'+email);
  const r=await fetch(q);
  if(r.ok){const found=await r.json();messages=found.messages||[];if(messages.length)break}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 assert.ok(messages.length,`No ${type} email in isolated local Mailpit mailbox`);checks++;
 const r=await fetch(new URL('/api/v1/message/'+encodeURIComponent(messages[0].ID),inbox));
 assert.ok(r.ok,'Could not retrieve local Mailpit email');
 const mail=await r.json();
 const body=[mail.Text,mail.HTML].filter(Boolean).join(' ').replaceAll('&amp;','&');
 const links=body.match(/https?:[^\s"'<>]+/g)||[];
 const match=links.map(x=>{try{return new URL(x)}catch{return null}}).find(x=>x?.pathname.includes('/verify')&&x.searchParams.get('type')===type);
 assert.ok(match,`No ${type} verification link in local email`);checks++;
 const token=match.searchParams.get('token')||match.searchParams.get('token_hash');
 assert.ok(token,'Local email verification token missing');checks++;
 return token;
}
const emailA=`wd-account-${seed}-a@example.test`,emailB=`wd-account-${seed}-b@example.test`;
const firstPassword='WD!'+randomBytes(20).toString('base64url');
const secondPassword='WD!'+randomBytes(20).toString('base64url');
async function signup(email,password){
 const result=await must('/auth/v1/signup',{method:'POST',body:{email,password}});
 const created=result.user||result;assert.ok(created.id,'Signup did not create user');checks++;
 assert.ok(!result.access_token,'Unconfirmed signup unexpectedly got a session');checks++;
 const token=await emailToken(email,'signup');
 const verified=await must('/auth/v1/verify',{method:'POST',body:{token_hash:token,type:'signup'}});
 assert.ok(verified.access_token,'Confirmation did not establish a session');checks++;
 return{id:created.id,email,password,token:verified.access_token};
}
const a=await signup(emailA,firstPassword),b=await signup(emailB,secondPassword);
const denied=await req('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:'wrong-password'}});
assert.ok(!denied.r.ok,'Wrong password accepted');checks++;
const signA=await must('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:a.password}});
assert.equal(signA.user.id,a.id);a.token=signA.access_token;checks++;
const signB=await must('/auth/v1/token?grant_type=password',{method:'POST',body:{email:b.email,password:b.password}});
assert.equal(signB.user.id,b.id);b.token=signB.access_token;checks++;
await must('/rest/v1/profiles',{method:'POST',token:a.token,body:{id:a.id,display_name:'Weggeef E2E A',home_place:'Nijkerk'}});
await must('/rest/v1/profiles',{method:'POST',token:b.token,body:{id:b.id,display_name:'Weggeef E2E B',home_place:'Nijkerk'}});
const privateA=await must('/rest/v1/profiles?select=id', {token:b.token});
assert.deepEqual(privateA.map(x=>x.id),[b.id],'B can read A private profile');checks++;
const listing=await must('/rest/v1/giveaway_listings?select=id',{method:'POST',token:a.token,body:{owner_id:a.id,title:'Hondenmand',description:'Grote schone hondenmand, gratis af te halen',kind:'gratis',category:'hond',town:'Nijkerk'},});
const items=await must('/rest/v1/giveaway_listings?select=owner_id,title',{token:b.token});
assert.ok(items.some(x=>x.owner_id===a.id&&x.title==='Hondenmand'),'B cannot see A listing');checks++;
const othersWrite=await req('/rest/v1/giveaway_listings?owner_id=eq.'+a.id,{token:b.token,method:'PATCH',body:{title:'Overgenomen'}});
assert.ok(!othersWrite.r.ok||othersWrite.r.status===204,'Unexpected mutation response');checks++;
const after=await must('/rest/v1/giveaway_listings?select=title&owner_id=eq.'+a.id,{token:a.token});
assert.equal(after[0].title,'Hondenmand','B modified A listing');checks++;
// The SAME two confirmed identities must exchange a private chat and a shared report.
await must('/rest/v1/rpc/set_profile_discoverability',{token:b.token,method:'POST',body:{enabled:true,profile_name:'Weggeef E2E B',profile_avatar:'🐕',profile_place:'Nijkerk',pet_breed:'Friese stabij'}});
const room=await must('/rest/v1/rpc/start_private_chat',{token:a.token,method:'POST',body:{target:b.id}});
await must('/rest/v1/chat_messages',{token:a.token,method:'POST',body:{room_id:room,user_id:a.id,body:'Bericht over gratis hondenmand'}});
const inboxB=await must('/rest/v1/chat_messages?room_id=eq.'+room+'&select=body',{token:b.token});
assert.ok(inboxB.some(x=>x.body==='Bericht over gratis hondenmand'),'B did not receive A private chat');checks++;
const reportId='wd-account-'+seed+'-report';
await must('/rest/v1/reports',{token:a.token,method:'POST',body:{id:reportId,user_id:a.id,author_name:'Weggeef E2E A',species:'dog',type:'danger',text:'Tijdelijke testmelding',lat:52.2,lng:5.4,geometry_type:'point'}});
const reportB=await must('/rest/v1/reports?id=eq.'+reportId+'&select=id,user_id,text',{token:b.token});
assert.equal(reportB[0]?.user_id,a.id,'B cannot read the shared report from A');checks++;
await req('/rest/v1/reports?id=eq.'+reportId,{token:b.token,method:'PATCH',body:{text:'Onbevoegd aangepast'}});
const original=await must('/rest/v1/reports?id=eq.'+reportId+'&select=text',{token:a.token});
assert.equal(original[0]?.text,'Tijdelijke testmelding','B modified A report');checks++;
await must('/auth/v1/recover',{method:'POST',body:{email:a.email}});
const recoveryToken=await emailToken(a.email,'recovery');
const recovery=await must('/auth/v1/verify',{method:'POST',body:{token_hash:recoveryToken,type:'recovery'}});
assert.ok(recovery.access_token,'Password recovery did not establish session');checks++;
await must('/auth/v1/user',{method:'PUT',token:recovery.access_token,body:{password:secondPassword}});
const obsolete=await req('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:firstPassword}});
assert.ok(!obsolete.r.ok,'Old password still works after reset');checks++;
const repaired=await must('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:secondPassword}});
assert.equal(repaired.user.id,a.id,'New password failed');checks++;
await must('/auth/v1/logout',{token:repaired.access_token,method:'POST'});
const signedout=await req('/auth/v1/user',{token:repaired.access_token});
assert.ok(!signedout.r.ok,'Signed-out token still authenticates');checks++;
// Self-deletion must remove the identity, its profile and its listings.
const fresh=await must('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:secondPassword}});
await must('/rest/v1/rpc/delete_my_account',{method:'POST',token:fresh.access_token,body:{}});
const gone=await req('/auth/v1/admin/users/'+a.id,{method:'GET',token:admin,k:admin});
assert.equal(gone.r.status,404,'Deleted account still exists');checks++;
const owned=await must('/rest/v1/giveaway_listings?select=id&owner_id=eq.'+a.id,{token:b.token});
assert.deepEqual(owned,[],'Deleted account listings were not cascaded');checks++;
const failedLogin=await req('/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password:secondPassword}});
assert.ok(!failedLogin.r.ok,'Deleted account can sign in');checks++;
// All remaining test data is ephemeral and local. Remove second identity, too.
await must('/auth/v1/admin/users/'+b.id,{method:'DELETE',token:admin,k:admin});
console.log(JSON.stringify({status:'PASS',scope:'local Supabase only',checks,journeys:['signup and email confirmation for two independent users','password login and wrong-password rejection','private profile RLS','giveaway listing cross-user read and ownership','private chat between the same two verified accounts','shared report visibility and nonowner write denial','recovery email and new password','logout token revocation','account self-deletion and listing cascade','deleted account login denied']}));

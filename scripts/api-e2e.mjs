import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
// Ephemeral local Supabase ONLY. Never point these destructive fixtures at production.
const status=JSON.parse(execFileSync('supabase',['status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const url=status.API_URL;assert.match(url,/^http:\/\/(127\.0\.0\.1|localhost):54321$/);
const key=status.ANON_KEY;let count=0;
async function request(path,token,method='GET',body,extra={}){
 const res=await fetch(url+path,{method,headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
 const raw=await res.text();let data;try{data=JSON.parse(raw)}catch{data=raw}return {res,data};
}
async function ok(...args){const out=await request(...args);assert.ok(out.res.ok,`${args[0]} ${out.res.status} ${JSON.stringify(out.data)}`);count++;return out.data;}
const a=await ok('/auth/v1/signup',null,'POST',{});const b=await ok('/auth/v1/signup',null,'POST',{});
assert.ok(a.access_token&&b.access_token);const ta=a.access_token,tb=b.access_token;
await ok('/rest/v1/profiles',ta,'POST',{id:a.user.id,display_name:'E2E A',home_lat:52.2,home_lng:5.4});
assert.deepEqual(await ok('/rest/v1/profiles?select=*',tb),[]);
const photo=a.user.id+'/e2e-report.jpg';
const uploaded=await fetch(url+'/storage/v1/object/report-photos/'+photo,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+ta,'Content-Type':'image/jpeg'},body:Buffer.from([255,216,255,217])});assert.ok(uploaded.ok,await uploaded.text());count++;
const row={id:'e2e-report',user_id:a.user.id,author_name:'E2E A',type:'danger',text:'Temporary test',lat:52.2,lng:5.4,geometry_type:'polygon',polygon:[[52.2,5.4],[52.3,5.4],[52.3,5.5]],photo_path:photo};
await ok('/rest/v1/reports',ta,'POST',row);
const reports=await ok('/rest/v1/reports?id=eq.e2e-report&select=*',tb);assert.equal(reports[0].polygon.length,3);
const signed=await ok('/storage/v1/object/sign/report-photos/'+photo,tb,'POST',{expiresIn:60});assert.ok(signed.signedURL);
assert.ok((await fetch(url+'/storage/v1'+signed.signedURL)).ok);count++;
assert.equal((await request('/rest/v1/reports?id=eq.e2e-report',tb,'PATCH',{text:'Attack'})).res.status,403);count++;
await ok('/rest/v1/push_subscriptions',ta,'POST',{user_id:a.user.id,endpoint:'https://push.example.test/e2e',p256dh:'test',auth:'test'});
assert.deepEqual(await ok('/rest/v1/push_subscriptions?select=*',tb),[]);
assert.equal((await request('/rest/v1/rpc/moderate_report',tb,'POST',{target:'e2e-report',next_status:'hidden',explanation:'Attack'})).res.status,403);count++;
const service=status.SERVICE_ROLE_KEY;
await ok('/rest/v1/reports?id=eq.e2e-report',service,'PATCH',{status:'hidden'});
assert.deepEqual(await ok('/rest/v1/reports?id=eq.e2e-report&select=*',tb),[]);
assert.ok(!(await request('/storage/v1/object/sign/report-photos/'+photo,tb,'POST',{expiresIn:60})).res.ok);count++;
console.log(`PASS: ${count} real local Auth/REST/Storage assertions; two-user sharing and access denial`);

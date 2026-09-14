import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';

const CONFIRM='RUN_HOSTED_E2E';
const EXPECTED_PROJECT_REF='dohelzkgruxnmejmplgw';
const confirmation=process.env.ALLOW_PRODUCTION_E2E||'';
const serviceKey=process.env.WHATSUP_DOG_E2E_SERVICE_ROLE_KEY||'';

assert.equal(confirmation,CONFIRM,'Refusing hosted E2E: explicit RUN_HOSTED_E2E confirmation is required');
assert.ok(serviceKey.length>20,'Refusing hosted E2E: WHATSUP_DOG_E2E_SERVICE_ROLE_KEY is missing');

const configText=readFileSync(new URL('../backend-config.js',import.meta.url),'utf8');
const url=configText.match(/url:'([^']+)'/)?.[1];
const publishableKey=configText.match(/publishableKey:'([^']+)'/)?.[1];
assert.equal(url,`https://${EXPECTED_PROJECT_REF}.supabase.co`,'Refusing hosted E2E: backend project does not match the approved production project');
assert.ok(publishableKey?.length>20,'Refusing hosted E2E: publishable key missing from backend config');

const runId=`wd-e2e-${Date.now()}-${randomBytes(3).toString('hex')}`;
const reportId=`${runId}-report`.slice(0,64);
const password=`Wd!${randomBytes(24).toString('base64url')}`;
const identities=[];
let photoPath='';
let reportCreated=false;
let assertions=0;
let cleanupErrors=[];

async function request(path,{token=serviceKey,key=serviceKey,method='GET',body,headers={}}={}){
  const response=await fetch(url+path,{
    method,
    headers:{apikey:key,Authorization:`Bearer ${token}`,...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const raw=await response.text();
  let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
  return {response,data};
}

async function must(path,opts={}){
  const out=await request(path,opts);
  assert.ok(out.response.ok,`${opts.method||'GET'} ${path} -> ${out.response.status}: ${JSON.stringify(out.data)}`);
  assertions++;
  return out.data;
}

async function createUser(label){
  const email=`${runId}-${label}@example.test`;
  const data=await must('/auth/v1/admin/users',{method:'POST',body:{email,password,email_confirm:true,user_metadata:{purpose:'whatsup-dog-hosted-e2e',run_id:runId}}});
  assert.ok(data?.id,'Admin user creation returned no id');
  identities.push({id:data.id,email,token:null});
  return identities.at(-1);
}

async function signIn(identity){
  const out=await request('/auth/v1/token?grant_type=password',{token:'',key:publishableKey,method:'POST',body:{email:identity.email,password}});
  assert.ok(out.response.ok,`Password sign-in failed for synthetic identity ${identity.id}: ${out.response.status}`);
  assert.ok(out.data?.access_token,'Synthetic sign-in returned no access token');
  identity.token=out.data.access_token;
  assertions++;
}

async function uploadJpeg(identity){
  photoPath=`${identity.id}/${reportId}.jpg`;
  const bytes=Buffer.from([0xff,0xd8,0xff,0xd9]);
  const response=await fetch(`${url}/storage/v1/object/report-photos/${photoPath}`,{
    method:'POST',
    headers:{apikey:publishableKey,Authorization:`Bearer ${identity.token}`,'Content-Type':'image/jpeg'},
    body:bytes
  });
  assert.ok(response.ok,`Photo upload failed: ${response.status} ${await response.text()}`);
  assertions++;
}

async function cleanup(){
  const exact=async(label,fn)=>{try{await fn()}catch(err){cleanupErrors.push(`${label}: ${err?.message||err}`)}};
  if(reportCreated){
    await exact('report',async()=>{const out=await request(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}`,{method:'DELETE'});if(!out.response.ok)throw new Error(`${out.response.status} ${JSON.stringify(out.data)}`)});
  }
  if(photoPath){
    await exact('photo',async()=>{const out=await request(`/storage/v1/object/report-photos/${photoPath}`,{method:'DELETE'});if(!out.response.ok&&out.response.status!==404)throw new Error(`${out.response.status} ${JSON.stringify(out.data)}`)});
  }
  for(const identity of [...identities].reverse()){
    await exact(`user ${identity.id}`,async()=>{const out=await request(`/auth/v1/admin/users/${identity.id}`,{method:'DELETE'});if(!out.response.ok&&out.response.status!==404)throw new Error(`${out.response.status} ${JSON.stringify(out.data)}`)});
  }
}

try{
  const a=await createUser('a');
  const b=await createUser('b');
  await signIn(a);await signIn(b);

  await must('/rest/v1/profiles',{token:a.token,key:publishableKey,method:'POST',body:{id:a.id,display_name:'Hosted E2E A',avatar:'🐶',home_place:'Testplaats',home_lat:52.2,home_lng:5.4}});
  await must('/rest/v1/profiles',{token:b.token,key:publishableKey,method:'POST',body:{id:b.id,display_name:'Hosted E2E B',avatar:'🐕',home_place:'Testplaats',home_lat:52.21,home_lng:5.41}});

  const hiddenProfile=await must('/rest/v1/profiles?select=id,display_name',{token:b.token,key:publishableKey});
  assert.deepEqual(hiddenProfile.map(x=>x.id),[b.id],'RLS leaked another private profile');assertions++;

  await uploadJpeg(a);
  await must('/rest/v1/reports',{token:a.token,key:publishableKey,method:'POST',body:{id:reportId,user_id:a.id,author_name:'Hosted E2E A',author_avatar:'🐶',type:'danger',text:'Synthetic hosted E2E fixture',lat:52.2,lng:5.4,geometry_type:'point',photo_path:photoPath}});
  reportCreated=true;

  const visible=await must(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}&select=id,user_id,photo_path,status`,{token:b.token,key:publishableKey});
  assert.equal(visible.length,1,'Second user could not see active shared report');
  assert.equal(visible[0].user_id,a.id);assert.equal(visible[0].photo_path,photoPath);assertions+=3;

  const signed=await must(`/storage/v1/object/sign/report-photos/${photoPath}`,{token:b.token,key:publishableKey,method:'POST',body:{expiresIn:60}});
  assert.ok(signed?.signedURL,'Second user did not receive a signed photo URL');assertions++;
  const photo=await fetch(url+'/storage/v1'+signed.signedURL);
  assert.ok(photo.ok,`Signed photo URL was not readable: ${photo.status}`);assertions++;

  const attack=await request(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}`,{token:b.token,key:publishableKey,method:'PATCH',body:{text:'unauthorized change'}});
  assert.equal(attack.response.status,403,'RLS unexpectedly allowed a second user to modify the report');assertions++;

  await must('/rest/v1/rpc/set_own_report_status',{token:a.token,key:publishableKey,method:'POST',body:{target:reportId,next_status:'hidden'}});
  const hidden=await must(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}&select=id`,{token:b.token,key:publishableKey});
  assert.deepEqual(hidden,[],'Hidden report remained visible to another user');assertions++;
  const signedAfterHide=await request(`/storage/v1/object/sign/report-photos/${photoPath}`,{token:b.token,key:publishableKey,method:'POST',body:{expiresIn:60}});
  assert.ok(!signedAfterHide.response.ok,'Hidden report photo was still signable by another user');assertions++;
} finally {
  await cleanup();
}

assert.deepEqual(cleanupErrors,[],`Hosted E2E cleanup incomplete: ${cleanupErrors.join('; ')}`);
const leftover=await must(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}&select=id`,{});
assert.deepEqual(leftover,[],'Synthetic report still exists after cleanup');assertions++;

console.log(JSON.stringify({status:'HOSTED_E2E_PASS',project:EXPECTED_PROJECT_REF,run_id:runId,assertions,cleanup:'complete'}));

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const EXPECTED='20260924-production-schema-v1';
const config=readFileSync(new URL('../backend-config.js',import.meta.url),'utf8');
const url=config.match(/url:'([^']+)'/)?.[1];
const key=config.match(/publishableKey:'([^']+)'/)?.[1];
assert.match(url||'',/^https:\/\/[a-z0-9-]+\.supabase\.co$/,'Approved hosted Supabase URL is required');
assert.ok(key?.length>20,'A publishable Supabase key must be configured');
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),12000);
try{
  const response=await fetch(url+'/rest/v1/rpc/whatsup_dog_release_marker',{
    method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:'{}',signal:controller.signal
  });
  assert.ok(response.ok,'Hosted database is not production-ready (release marker unavailable: '+response.status+')');
  const marker=await response.json();
  assert.equal(marker,EXPECTED,'Hosted database migrations do not match this frontend release');
  console.log('PASS: hosted Whatsup Dog database release marker verified');
}finally{clearTimeout(timeout)}

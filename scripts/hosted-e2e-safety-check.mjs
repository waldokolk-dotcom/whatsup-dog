import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('./hosted-e2e.mjs',import.meta.url),'utf8');
const workflow=readFileSync(new URL('../.github/workflows/hosted-e2e.yml',import.meta.url),'utf8');
const ONE_SHOT_BRANCH='test/hosted-production-e2e-20260915';
const ONE_SHOT_REF=`refs/heads/${ONE_SHOT_BRANCH}`;

for(const required of [
  "const CONFIRM='RUN_HOSTED_E2E'",
  "const EXPECTED_PROJECT_REF='dohelzkgruxnmejmplgw'",
  'WHATSUP_DOG_E2E_SERVICE_ROLE_KEY',
  'finally {',
  "purpose:'whatsup-dog-hosted-e2e'",
  "cleanup:'complete'",
  "status:'HOSTED_E2E_PASS'"
]) assert.ok(script.includes(required),`Hosted E2E safety invariant missing: ${required}`);

assert.match(workflow,/workflow_dispatch:/,'Hosted E2E must retain manual dispatch');
assert.doesNotMatch(workflow,/\n\s+(pull_request|schedule):/,'Hosted E2E must never run on PR or a schedule');
const hasPush=/\n\s+push:/.test(workflow);
if(hasPush){
  assert.ok(workflow.includes(`- ${ONE_SHOT_BRANCH}`),'One-shot push must be pinned to the exact temporary branch');
  assert.ok(workflow.includes('- .github/hosted-e2e-trigger'),'One-shot push must be path-limited to the exact trigger file');
  assert.ok(workflow.includes(`github.ref == '${ONE_SHOT_REF}'`),'One-shot job must verify the exact temporary branch ref');
  assert.ok(workflow.includes("github.event_name == 'push'"),'One-shot job must explicitly verify a push event');
}
assert.ok(workflow.includes("confirmation == 'RUN_HOSTED_E2E'"),'Hosted E2E workflow must require explicit confirmation for manual dispatch');
assert.ok(workflow.includes('secrets.WHATSUP_DOG_E2E_SERVICE_ROLE_KEY'),'Service role credential must come from an Actions secret');
assert.doesNotMatch(workflow,/sb_secret_|service_role[^\n]*[:=][^\n]*eyJ/i,'Privileged credential appears hard-coded in workflow');
assert.doesNotMatch(script,/delete\s+from|truncate\s|drop\s+table/i,'Harness must not contain broad SQL destructive operations');

console.log(hasPush
  ? 'PASS Hosted production E2E safety check: one-shot branch/path-pinned trigger, project-pinned, secret-backed, exact-fixture cleanup'
  : 'PASS Hosted production E2E safety check: manual-only, project-pinned, secret-backed, exact-fixture cleanup');

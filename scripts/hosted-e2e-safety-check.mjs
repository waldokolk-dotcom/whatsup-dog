import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('./hosted-e2e.mjs',import.meta.url),'utf8');
const workflow=readFileSync(new URL('../.github/workflows/hosted-e2e.yml',import.meta.url),'utf8');

for(const required of [
  "const CONFIRM='RUN_HOSTED_E2E'",
  "const EXPECTED_PROJECT_REF='dohelzkgruxnmejmplgw'",
  'WHATSUP_DOG_E2E_SERVICE_ROLE_KEY',
  'finally {',
  "purpose:'whatsup-dog-hosted-e2e'",
  "cleanup:'complete'",
  "status:'HOSTED_E2E_PASS'"
]) assert.ok(script.includes(required),`Hosted E2E safety invariant missing: ${required}`);

assert.match(workflow,/workflow_dispatch:/,'Hosted E2E must remain manually dispatched');
assert.doesNotMatch(workflow,/\n\s+(push|pull_request|schedule):/,'Hosted E2E must never run on push, PR, or a schedule');
assert.ok(workflow.includes("confirmation == 'RUN_HOSTED_E2E'"),'Hosted E2E workflow must require explicit confirmation');
assert.ok(workflow.includes('secrets.WHATSUP_DOG_E2E_SERVICE_ROLE_KEY'),'Service role credential must come from an Actions secret');
assert.doesNotMatch(workflow,/sb_secret_|service_role[^\n]*[:=][^\n]*eyJ/i,'Privileged credential appears hard-coded in workflow');
assert.doesNotMatch(script,/delete\s+from|truncate\s|drop\s+table/i,'Harness must not contain broad SQL destructive operations');

console.log('PASS Hosted production E2E safety check: manual-only, project-pinned, secret-backed, exact-fixture cleanup');

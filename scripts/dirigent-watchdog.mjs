#!/usr/bin/env node
import fs from 'node:fs';

const workflowName = 'Dirigent autonomous cycle';

export function evaluateDirigentRuns(payload, now = new Date(), maxAgeHours = 8) {
  if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) throw new Error('maxAgeHours must be positive');
  const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
  const cutoff = now.getTime() - maxAgeHours * 60 * 60 * 1000;
  const recent = runs
    .filter(run => ['schedule', 'workflow_dispatch'].includes(run?.event))
    .filter(run => Number.isFinite(Date.parse(run?.created_at)))
    .filter(run => Date.parse(run.created_at) >= cutoff)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return { missing: recent.length === 0, latest: recent[0] || null, cutoff: new Date(cutoff).toISOString() };
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
}

function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--runs-file');
  const ageIndex = args.indexOf('--max-age-hours');
  if (fileIndex < 0 || !args[fileIndex + 1]) throw new Error('Usage: dirigent-watchdog.mjs --runs-file <json> [--max-age-hours <hours>]');
  const payload = JSON.parse(fs.readFileSync(args[fileIndex + 1], 'utf8'));
  const now = process.env.DIRIGENT_WATCHDOG_NOW ? new Date(process.env.DIRIGENT_WATCHDOG_NOW) : new Date();
  if (!Number.isFinite(now.getTime())) throw new Error('DIRIGENT_WATCHDOG_NOW is invalid');
  const maxAgeHours = ageIndex >= 0 ? Number(args[ageIndex + 1]) : 8;
  const result = evaluateDirigentRuns(payload, now, maxAgeHours);
  output('missing', String(result.missing));
  output('cutoff', result.cutoff);
  output('latest_run_id', result.latest?.id || '');
  const summary = result.missing
    ? `BLOCKED: no ${workflowName} run was created after ${result.cutoff}; fallback dispatch is required.`
    : `OK: ${workflowName} run ${result.latest.id} (${result.latest.event}, ${result.latest.status}/${result.latest.conclusion || 'pending'}) was created at ${result.latest.created_at}.`;
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Dirigent schedule watchdog\n\n${summary}\n`);
  console.log(summary);
}

const invokedPath = process.argv[1]?.replaceAll('\\', '/');
if (invokedPath && import.meta.url === `file:///${invokedPath.replace(/^\//, '')}`) main();

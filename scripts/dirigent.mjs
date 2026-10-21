#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY || 'waldokolk-dotcom/whatsup-dog';
const runId = process.env.GITHUB_RUN_ID || 'local';
const explicitIssue = process.env.DIRIGENT_ISSUE || '';
const marker = /<!--\s*dirigent-task\s*([\s\S]*?)-->/i;
const priorities = new Map([['priority:p0', 400], ['priority:p1', 300], ['priority:p2', 200], ['priority:p3', 100]]);
const denied = /(^|\/)(\.github|scripts\/dirigent|node_modules|auth|security|secrets?|migrations?|supabase)(\/|$)|(^|\/)(package(?:-lock)?\.json|sw\.js|version\.js|\.env(?:\.|$))/i;
const allowed = /^(tests|scripts)\/[A-Za-z0-9._/-]+\.(?:js|mjs|json|md)$|^[A-Za-z0-9._-]+\.(?:js|css|html|md)$/;

function call(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', timeout: options.timeout || 180000, ...options }).trim();
}
function gh(args) { return JSON.parse(call('gh', args)); }
function labels(issue) { return (issue.labels || []).map(label => String(label.name || label).toLowerCase()); }
function score(issue) { return Math.max(0, ...labels(issue).map(label => priorities.get(label) || 0)); }
function validatePath(file) {
  return typeof file === 'string' && allowed.test(file) && !denied.test(file) && !file.includes('..') && !path.isAbsolute(file);
}
function parseTask(issue) {
  if (!/^\[Dirigent\]/i.test(issue.title || '')) throw new Error('Issue title must start with [Dirigent]');
  const match = String(issue.body || '').match(marker);
  if (!match) throw new Error('Issue has no dirigent-task marker');
  const task = JSON.parse(match[1]);
  if (task.version !== 1 || !Array.isArray(task.changes) || task.changes.length < 1 || task.changes.length > 3) throw new Error('Task must contain 1-3 version 1 changes');
  if (typeof task.user_value !== 'string' || !task.user_value.trim()) throw new Error('Task needs a concrete user_value');
  if (!Array.isArray(task.acceptance) || task.acceptance.length < 1 || task.acceptance.some(value => typeof value !== 'string' || !value.trim())) throw new Error('Task needs acceptance criteria');
  for (const change of task.changes) {
    if (!validatePath(change.path)) throw new Error(`Path is outside the allowlist: ${change.path}`);
    if (typeof change.find !== 'string' || !change.find || typeof change.replace !== 'string') throw new Error(`Invalid exact replacement for ${change.path}`);
    if (change.find.length > 20000 || change.replace.length > 20000) throw new Error(`Replacement too large for ${change.path}`);
  }
  return task;
}
async function chooseIssue() {
  if (explicitIssue) {
    if (!/^\d{1,8}$/.test(explicitIssue)) throw new Error('Invalid issue number');
    return gh(['issue', 'view', explicitIssue, '-R', repo, '--json', 'number,title,body,state,labels,url']);
  }
  const issues = gh(['issue', 'list', '-R', repo, '--state', 'open', '--limit', '100', '--json', 'number,title,body,state,labels,url']);
  return issues.filter(issue => /^\[Dirigent\]/i.test(issue.title || '') && labels(issue).includes('dirigent:ready'))
    .sort((a, b) => score(b) - score(a) || a.number - b.number)[0];
}
async function applyTask(task) {
  const touched = [];
  for (const change of task.changes) {
    const full = path.resolve(change.path);
    if (!full.startsWith(process.cwd() + path.sep)) throw new Error('Resolved path escaped repository');
    const current = await fs.readFile(full, 'utf8');
    const first = current.indexOf(change.find);
    if (first < 0 || first !== current.lastIndexOf(change.find)) throw new Error(`Expected exactly one match in ${change.path}`);
    const next = current.slice(0, first) + change.replace + current.slice(first + change.find.length);
    if (next === current) throw new Error(`No effective change in ${change.path}`);
    await fs.writeFile(full, next);
    touched.push(change.path);
  }
  return touched;
}
async function report(text) {
  await fs.writeFile('dirigent-result.md', `# Dirigent run\n\n${text}\n`);
  console.log(text);
}
async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}
async function selfTest() {
  const issue = { title: '[Dirigent] test', body: '<!-- dirigent-task {"version":1,"user_value":"A visible improvement","changes":[{"path":"tests/example.spec.mjs","find":"a","replace":"b"}],"acceptance":["test"]} -->' };
  const parsed = parseTask(issue);
  if (!validatePath(parsed.changes[0].path) || validatePath('.github/workflows/a.yml') || validatePath('sw.js') || validatePath('supabase/functions/a.js')) throw new Error('Path policy self-test failed');
  console.log('Dirigent self-test passed');
}
async function main() {
  if (process.argv[2] === 'self-test') return selfTest();
  const issue = await chooseIssue();
  if (!issue) {
    await report('BLOCKED: No ready Dirigent issue with a bounded, user-value task; no iteration was produced.');
    process.exitCode = 1;
    return;
  }
  if (issue.state !== 'OPEN') throw new Error('Selected issue is not open');
  const task = parseTask(issue);
  const existing = gh(['pr', 'list', '-R', repo, '--state', 'open', '--search', `head:dirigent/issue-${issue.number}-`, '--json', 'url']);
  if (existing.length) {
    await report(`BLOCKED: Issue #${issue.number} already has an open Dirigent PR: ${existing[0].url}`);
    process.exitCode = 1;
    return;
  }
  const branch = `dirigent/issue-${issue.number}-${runId}`;
  call('git', ['config', 'user.name', 'dirigent[bot]']);
  call('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  call('git', ['checkout', '-b', branch]);
  const touched = await applyTask(task);
  const actual = call('git', ['diff', '--name-only']).split(/\r?\n/).filter(Boolean);
  if (actual.length !== touched.length || actual.some(file => !touched.includes(file))) throw new Error(`Unexpected changed files: ${actual.join(', ')}`);
  call('git', ['diff', '--check']);
  call('git', ['add', '--', ...touched]);
  call('git', ['commit', '-m', `dirigent: execute approved issue #${issue.number}`]);
  call('git', ['push', 'origin', branch]);
  const body = [`Resolves #${issue.number}`, '', 'Automated by Dirigent from an explicitly approved, bounded issue recipe.', '', `Changed: ${touched.map(file => '`' + file + '`').join(', ')}`, '', 'Repository quality gates must pass. This pull request is a draft and cannot release without the separate release approval workflow.'].join('\n');
  const url = call('gh', ['pr', 'create', '-R', repo, '--draft', '--base', 'main', '--head', branch, '--title', `Dirigent: ${issue.title.replace(/^\[Dirigent\]\s*/i, '').slice(0, 90)}`, '--body', body]);
  await setOutput('branch', branch);
  await setOutput('pull_request_url', url);
  await report(`Selected issue #${issue.number} (priority score ${score(issue)}).\n\nUser value: ${task.user_value}\n\nCreated isolated branch \`${branch}\` and draft pull request: ${url}`);
}

main().catch(async error => { await report(`BLOCKED: ${String(error.message || error).slice(0, 1000)}`); process.exitCode = 1; });

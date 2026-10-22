import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateDirigentRuns } from '../scripts/dirigent-watchdog.mjs';

const now = new Date('2026-10-22T13:40:00Z');

test('flags a missed run after the allowed schedule delay', () => {
  const result = evaluateDirigentRuns({ workflow_runs: [
    { id: 1, event: 'schedule', created_at: '2026-10-21T10:32:25Z' },
  ] }, now, 8);
  assert.equal(result.missing, true);
});

test('accepts a recent scheduled run', () => {
  const result = evaluateDirigentRuns({ workflow_runs: [
    { id: 2, event: 'schedule', status: 'completed', conclusion: 'success', created_at: '2026-10-22T10:12:00Z' },
  ] }, now, 8);
  assert.equal(result.missing, false);
  assert.equal(result.latest.id, 2);
});

test('accepts a manual recovery run and ignores unrelated events', () => {
  const result = evaluateDirigentRuns({ workflow_runs: [
    { id: 3, event: 'pull_request', created_at: '2026-10-22T13:00:00Z' },
    { id: 4, event: 'workflow_dispatch', created_at: '2026-10-22T12:00:00Z' },
  ] }, now, 8);
  assert.equal(result.missing, false);
  assert.equal(result.latest.id, 4);
});

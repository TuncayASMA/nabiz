const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseCodex, parseClaude, parseGemini, parseAntigravity, parseGrok, parseElevenLabs, DEFINITIONS, requestJson, ProviderError } = require('../src/providers.cjs');
const { retainReading, UsageStore } = require('../src/store.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('Codex reports a primary weekly window without inventing a five-hour quota', () => {
  const result = parseCodex({ rateLimits: { planType: 'prolite', primary: { usedPercent: 30, windowDurationMins: 10080, resetsAt: 1793083744 }, secondary: null }, rateLimitResetCredits: { availableCount: 3 } });
  assert.equal(result.quotas.length, 1);
  assert.equal(result.quotas[0].label, 'Haftalık');
  assert.equal(result.quotas[0].used, 30);
  assert.equal(result.plan, 'Pro Lite');
  assert.match(result.note, /^3 /);
});
test('Codex selects the codex bucket, preserving zero usage', () => {
  const result = parseCodex({ rateLimits: { primary: { usedPercent: 95 } }, rateLimitsByLimitId: { codex: { primary: { usedPercent: 0, windowDurationMins: 300 } } } });
  assert.equal(result.quotas[0].used, 0);
  assert.equal(result.quotas[0].label, '5 saatlik');
});
test('Claude omits absent model buckets and preserves zero', () => {
  const result = parseClaude({ five_hour: { utilization: 0 }, seven_day: { utilization: 72 }, seven_day_opus: null }, 'pro');
  assert.deepEqual(result.quotas.map(q => q.used), [0, 72]);
});
test('Missing and malformed usage is never displayed as zero', () => {
  for (const value of [undefined, null, '0', NaN, -1]) assert.throws(() => parseClaude({ five_hour: { utilization: value } }), ProviderError);
  assert.throws(() => parseGemini({ buckets: [{ remainingFraction: null }] }), ProviderError);
  assert.throws(() => parseGrok({ config: { monthlyLimit: { val: 100 } } }), ProviderError);
});
test('Gemini full quota may omit remainingAmount; separate model buckets stay separate', () => {
  const result = parseGemini({ buckets: [{ modelId: 'gemini-pro', remainingFraction: 1 }, { modelId: 'gemini-flash', remainingFraction: .42 }] });
  assert.deepEqual(result.quotas.map(q => q.used), [0, 58]);
});
test('Grok respects the period reported by the service', () => {
  const result = parseGrok({ config: { creditUsagePercent: 2.5, currentPeriod: { type: 'USAGE_PERIOD_TYPE_WEEKLY', end: '2026-10-28T12:00:00Z' }, isUnifiedBillingUser: true } });
  assert.equal(result.quotas[0].label, 'Haftalık');
  assert.equal(result.quotas[0].used, 2.5);
  assert.match(result.note, /ortak/);
});
test('Antigravity retains separate Argon and shared pools and verifies no model turns ran', () => {
  const data = { num_turns: 0, command: { name: 'usage', data: { groups: [
    { name: 'Gemini Models', buckets: [{ id: 'gemini-weekly', remaining_fraction: 1, window: 'weekly' }] },
    { name: 'Gemini 4 Argon', buckets: [{ id: 'gemini-argon-weekly', remaining_fraction: .65, window: 'weekly' }] },
    { name: 'Claude and GPT models', buckets: [{ id: '3p-weekly', remaining_fraction: .52, window: 'weekly' }] },
  ] } } };
  const result = parseAntigravity(data);
  assert.deepEqual(result.quotas.map(q => q.used), [35, 0, 48]);
  assert.match(result.quotas[0].label, /Argon/);
  assert.throws(() => parseAntigravity({ ...data, num_turns: 1 }), ProviderError);
});
test('ElevenLabs uses account character totals, preserving overage and renewal period', () => {
  const result = parseElevenLabs({ character_count: 15000, character_limit: 30000, tier: 'creator', character_refresh_period: 'monthly_period', next_character_count_reset_unix: 1893456000 });
  assert.equal(result.quotas[0].used, 50);
  assert.equal(result.quotas[0].label, 'Aylık karakter');
  assert.match(result.note, /15.000 kaldı/);
  assert.equal(parseElevenLabs({ character_count: 150, character_limit: 100 }).quotas[0].used, 150);
  assert.throws(() => parseElevenLabs({ character_count: 1, character_limit: 0 }), ProviderError);
});
test('Network failure keeps dated stale data; auth failure clears previous account data', () => {
  const reading = { quotas: [{ used: 72 }], updatedAt: '2026-10-21T12:00:00Z', status: 'live' };
  assert.equal(retainReading(reading, new ProviderError('network', 'offline'), 'now').status, 'stale');
  assert.equal(retainReading(reading, new ProviderError('network', 'offline'), 'now').updatedAt, reading.updatedAt);
  assert.deepEqual(retainReading(reading, new ProviderError('auth', 'expired'), 'now').quotas, []);
});
test('HTTP errors are sanitized and redirects are disabled', async () => {
  let options;
  await assert.rejects(requestJson('https://example.com', {}, async (_url, o) => { options = o; return { status: 401 }; }), e => e.code === 'auth' && !e.message.includes('token'));
  assert.equal(options.redirect, 'error');
  await assert.rejects(requestJson('https://example.com', {}, async () => ({ status: 429, headers: new Headers({ 'retry-after': '600' }) })), e => e.retryAfter === 600000);
});
test('Concurrent refreshes share one request per provider and obey cooldown', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kota-test-')); let calls = 0;
  const callback = async () => { calls++; return { quotas: [{ used: 1 }], plan: 'test' }; };
  const store = new UsageStore(Object.fromEntries(DEFINITIONS.map(({ id }) => [id, callback])), path.join(dir, 'cache.json'));
  await Promise.all([store.refresh(), store.refresh()]);
  await store.refresh();
  assert.equal(calls, 5);
  assert.ok(store.snapshot().every(p => p.status === 'live'));
  assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(dir).startsWith('kota-test-'));
  fs.rmSync(dir, { recursive: true, force: true });
});

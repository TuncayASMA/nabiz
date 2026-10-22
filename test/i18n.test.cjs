const { test } = require('node:test');
const assert = require('node:assert/strict');
const { messages, text, resolve, initialLanguage, provider, message } = require('../src/ui/i18n.js');
const { sampleProviders } = require('../src/demo.cjs');
const { DEFINITIONS, ProviderError } = require('../src/providers.cjs');
const { retainReading } = require('../src/store.cjs');

test('Language follows the first system preference, explicit choice, or Turkish upgrade preference', () => {
  for (const locale of ['tr', 'tr-TR', 'TR_tr']) assert.equal(initialLanguage({}, locale), 'tr');
  for (const locale of ['en-GB', 'de-DE', undefined]) assert.equal(initialLanguage({}, locale), 'en');
  assert.equal(initialLanguage({ language: 'en', pinned: true }, 'tr-TR'), 'en');
  assert.equal(initialLanguage({ language: 'tr' }, 'en-US'), 'tr');
  assert.equal(initialLanguage({ pinned: false }, 'en-US'), 'tr');
  assert.equal(initialLanguage({ language: 'unsupported' }, 'en-US'), 'en');
});

test('Every translation has both languages with matching interpolation parameters', () => {
  const params = value => [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  for (const [key, pair] of Object.entries(messages)) {
    assert.equal(pair.length, 2, key);
    assert.ok(pair.every(value => typeof value === 'string' && value.length), key);
    assert.deepEqual(params(pair[0]), params(pair[1]), key);
  }
  assert.equal(text('en', 'percentUsed', { value: 35.3 }), '35.3% used');
  assert.equal(text('tr', 'percentUsed', { value: 35.3 }), 'Yüzde 35,3 kullanıldı');
});

test('All five providers change language without changing any measurement', async () => {
  const samples = sampleProviders();
  const english = [], turkish = [];
  for (const definition of DEFINITIONS) {
    const original = { ...definition, ...await samples[definition.id]() };
    const before = JSON.stringify(original);
    const en = provider('en', original), tr = provider('tr', original);
    assert.deepEqual(en.quotas.map(({ used, resetsAt, key }) => ({ used, resetsAt, key })), tr.quotas.map(({ used, resetsAt, key }) => ({ used, resetsAt, key })));
    assert.equal(JSON.stringify(original), before);
    english.push(en); turkish.push(tr);
  }
  assert.equal(english[0].quotas[0].label, '5-hour');
  assert.equal(english[1].note, 'Codex usage pool');
  assert.equal(english[2].quotas[0].label, 'Gemini 4 Argon · week');
  assert.equal(english[3].quotas[0].label, 'Weekly');
  assert.equal(english[4].note, '15,000 / 30,000 characters · 15,000 left');
  assert.equal(turkish[4].note, '15.000 / 30.000 karakter · 15.000 kaldı');
});

test('Cached readings and sanitized errors can be translated after an offline language change', () => {
  const old = { quotas: [{ label: '5 saatlik', used: 12.5 }, { label: 'Gemini 4 Argon · hafta', used: 31 }], note: '15.000 / 30.000 karakter · 15.000 kaldı', updatedAt: '2026-10-22T12:00:00Z' };
  const retained = retainReading(old, new ProviderError('network', message('error.network')), 'now');
  const en = provider('en', retained);
  assert.equal(en.quotas[0].label, '5-hour');
  assert.equal(en.quotas[1].label, 'Gemini 4 Argon · week');
  assert.equal(en.note, '15,000 / 30,000 characters · 15,000 left');
  assert.equal(en.error, 'Could not connect. Retrying shortly.');
  assert.equal(en.status, 'stale');
  assert.equal(en.updatedAt, old.updatedAt);
  assert.equal(resolve('en', 'New provider model name'), 'New provider model name');
});

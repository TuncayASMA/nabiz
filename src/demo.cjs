// Entirely fictional, deterministic account data for tests and public screenshots.
function sampleProviders() {
  const reset = hours => new Date(Date.now() + hours * 3600000).toISOString();
  const q = (label, used, hours, key = label) => ({ key, label, used, resetsAt: reset(hours) });
  const data = {
    claude: { plan: 'Pro', quotas: [q('5 saatlik', 24, 2), q('Haftalık', 58, 60)], note: 'Claude ve Claude Code ortak kullanım' },
    codex: { plan: 'Plus', quotas: [q('Haftalık', 42, 84)], note: 'Codex kullanım havuzu' },
    gemini: { plan: 'Antigravity', quotas: [q('Gemini 4 Argon · hafta', 68, 92, 'argon'), q('Flash / Pro · hafta', 12, 92), q('Flash / Pro · 5 saat', 5, 4), q('Claude / GPT · hafta', 32, 92), q('Claude / GPT · 5 saat', 8, 4)] },
    grok: { plan: 'SuperGrok', quotas: [q('Haftalık', 21, 48)], note: 'Grok Build kullanım havuzu' },
    elevenlabs: { plan: 'Starter', quotas: [q('Aylık karakter', 50, 240)], note: '15.000 / 30.000 karakter · 15.000 kaldı' },
  };
  return Object.fromEntries(Object.entries(data).map(([id, value]) => [id, async () => value]));
}
module.exports = { sampleProviders };

// Entirely fictional, deterministic account data for tests and public screenshots.
const { message: m } = require('./ui/i18n.js');
function sampleProviders() {
  const reset = hours => new Date(Date.now() + hours * 3600000).toISOString();
  const q = (label, used, hours, key = label.messageKey) => ({ key, label, used, resetsAt: reset(hours) });
  const data = {
    claude: { plan: 'Pro', quotas: [q(m('quota.hours', { count: 5 }), 24, 2), q(m('quota.weekly'), 58, 60)], note: m('note.claude') },
    codex: { plan: 'Plus', quotas: [q(m('quota.weekly'), 42, 84)], note: m('note.codex') },
    gemini: { plan: 'Antigravity', quotas: [q(m('quota.modelWeek', { model: 'Gemini 4 Argon' }), 68, 92, 'argon'), q(m('quota.modelWeek', { model: 'Flash / Pro' }), 12, 92), q(m('quota.modelHours', { model: 'Flash / Pro', count: 5 }), 5, 4), q(m('quota.modelWeek', { model: 'Claude / GPT' }), 32, 92), q(m('quota.modelHours', { model: 'Claude / GPT', count: 5 }), 8, 4)] },
    grok: { plan: 'SuperGrok', quotas: [q(m('quota.weekly'), 21, 48)], note: m('note.grok') },
    elevenlabs: { plan: 'Starter', quotas: [q(m('quota.charactersMonthly'), 50, 240)], note: m('note.characters', { used: 15000, limit: 30000, remaining: 15000 }) },
  };
  return Object.fromEntries(Object.entries(data).map(([id, value]) => [id, async () => value]));
}
module.exports = { sampleProviders };

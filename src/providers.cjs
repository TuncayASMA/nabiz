const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);
const { findExecutable } = require('./platform.cjs');
const { version } = require('../package.json');
const { message: m, resolve } = require('./ui/i18n.js');
const userAgent = `Nabiz/${version}`;

const DEFINITIONS = [
  { id: 'claude', name: 'Claude', subtitle: 'Claude · Claude Code', color: '#da9777', url: 'https://claude.ai/settings/usage', login: 'claude auth login' },
  { id: 'codex', name: 'ChatGPT', subtitle: m('provider.codex'), color: '#79c9ac', url: 'https://chatgpt.com/codex/settings/usage', login: 'codex login' },
  { id: 'gemini', name: 'Gemini', subtitle: m('provider.gemini'), color: '#a6a2ff', url: 'https://antigravity.google.com/', login: 'agy' },
  { id: 'grok', name: 'Grok', subtitle: 'Grok · Build', color: '#b9c9e3', url: 'https://grok.com/', login: 'grok login' },
  { id: 'elevenlabs', name: 'ElevenLabs', subtitle: m('provider.elevenlabs'), color: '#d4c595', url: 'https://elevenlabs.io/app/subscription', login: null },
];

class ProviderError extends Error {
  constructor(code, message, retryAfter = 0) { super(resolve('en', message)); this.displayMessage = message; this.code = code; this.retryAfter = retryAfter; }
}
function percentage(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
function iso(value) {
  if (value == null) return null;
  const date = new Date(typeof value === 'number' ? value * 1000 : value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function windowLabel(minutes) {
  if (minutes === 10080) return m('quota.weekly');
  if (minutes === 1440) return m('quota.daily');
  if (!Number.isFinite(minutes) || minutes <= 0) return m('quota.usage');
  return minutes % 60 === 0 ? m('quota.hours', { count: minutes / 60 }) : m('quota.minutes', { count: minutes });
}
function quota(label, used, resetsAt, key = typeof label === 'string' ? label : label.messageKey) {
  const percent = percentage(used);
  return percent === null ? null : { key, label, used: percent, resetsAt: iso(resetsAt) };
}
function requireQuotas(data) {
  if (!data.quotas.length) throw new ProviderError('unavailable', m('error.noQuota'));
  return data;
}
function parseCodex(data) {
  // The primary window is not always five hours; some plans only report a week.
  const rate = data.rateLimitsByLimitId?.codex || data.rateLimits;
  const quotas = [rate?.primary, rate?.secondary].filter(Boolean).map((q, i) =>
    quota(windowLabel(q.windowDurationMins), q.usedPercent, q.resetsAt, `codex-${i}`)).filter(Boolean);
  const count = data.rateLimitResetCredits?.availableCount;
  const plan = { plus: 'Plus', pro: 'Pro', prolite: 'Pro Lite', team: 'Team', business: 'Business', free: 'Free' }[rate?.planType] || rate?.planType || 'ChatGPT';
  return requireQuotas({ plan, quotas, note: typeof count === 'number' && count > 0 ? m('note.codexReset', { count }) : m('note.codex') });
}
function parseClaude(data, plan) {
  const fields = [['five_hour', m('quota.hours', { count: 5 })], ['seven_day', m('quota.weekly')], ['seven_day_opus', m('quota.modelWeek', { model: 'Opus' })], ['seven_day_sonnet', m('quota.modelWeek', { model: 'Sonnet' })]];
  const quotas = fields.map(([key, label]) => quota(label, data[key]?.utilization, data[key]?.resets_at, key)).filter(Boolean);
  return requireQuotas({ plan: plan ? plan[0].toUpperCase() + plan.slice(1) : 'Claude', quotas, note: m('note.claude') });
}
function parseGemini(data, plan) {
  const quotas = (data.buckets || []).map((b, i) => {
    if (typeof b.remainingFraction !== 'number' || b.remainingFraction < 0 || b.remainingFraction > 1) return null;
    return quota(b.modelId || m('quota.modelPool'), Math.round((1 - b.remainingFraction) * 1000) / 10, b.resetTime, `${b.modelId}-${i}`);
  }).filter(Boolean);
  return requireQuotas({ plan: plan || 'Google', quotas, note: m('note.geminiCli') });
}
function parseGrok(data) {
  const c = data.config;
  const weekly = c?.currentPeriod?.type === 'USAGE_PERIOD_TYPE_WEEKLY';
  const used = c?.creditUsagePercent ?? (Number(c?.monthlyLimit?.val) > 0 && c?.used?.val != null ? Number(c.used.val) / Number(c.monthlyLimit.val) * 100 : null);
  return requireQuotas({ plan: data.subscriptionTier || 'Grok', quotas: [quota(m(weekly ? 'quota.weekly' : c?.currentPeriod?.type === 'USAGE_PERIOD_TYPE_MONTHLY' ? 'quota.monthly' : 'quota.credits'), used, c?.currentPeriod?.end || c?.billingPeriodEnd)].filter(Boolean), note: m(c?.isUnifiedBillingUser ? 'note.grokUnified' : 'note.grok') });
}

function parseElevenLabs(data) {
  const count = data.character_count, limit = data.character_limit;
  if (percentage(count) === null || percentage(limit) === null || limit <= 0) throw new ProviderError('unavailable', m('error.noCharacters'));
  const label = m({ monthly_period: 'quota.charactersMonthly', '3_month_period': 'quota.characters3Months', '6_month_period': 'quota.characters6Months', annual_period: 'quota.charactersAnnual' }[data.character_refresh_period] || 'quota.characters');
  const plan = data.tier ? data.tier[0].toUpperCase() + data.tier.slice(1) : 'ElevenLabs';
  return { plan, quotas: [quota(label, Math.round(count / limit * 1000) / 10, data.next_character_count_reset_unix, 'characters')], note: m('note.characters', { used: count, limit, remaining: Math.max(0, limit - count) }) };
}

function parseAntigravity(data) {
  if (data.command?.name !== 'usage' || data.num_turns !== 0) throw new ProviderError('format', m('error.agyFormat'));
  const groups = data.command.data?.groups || [];
  const quotas = groups.flatMap(group => (group.buckets || []).map(b => {
    const left = b.remaining_fraction;
    if (typeof left !== 'number' || left < 0 || left > 1) return null;
    const name = group.name === 'Gemini Models' ? 'Flash / Pro' : group.name === 'Claude and GPT models' ? 'Claude / GPT' : group.name;
    const label = b.window === 'weekly' ? m('quota.modelWeek', { model: name }) : b.window === '5h' ? m('quota.modelHours', { model: name, count: 5 }) : `${name} · ${b.window}`;
    return quota(label, Math.round((1 - left) * 1000) / 10, b.reset_time, b.id);
  })).filter(Boolean);
  // Put the dedicated Argon pool before shared Gemini windows and optional third-party pools.
  quotas.sort((a, b) => {
    const rank = q => /argon/i.test(q.key) ? 0 : /^gemini/.test(q.key) ? 1 : 2;
    return rank(a) - rank(b);
  });
  return requireQuotas({ plan: 'Antigravity', quotas, note: m('note.antigravity') });
}

async function readAntigravity(home) {
  const binary = await findExecutable('agy', { home });
  if (!binary) throw new ProviderError('auth', m('error.agyInstall'));
  let output;
  try {
    output = await execFileAsync(binary, ['-p', '/usage', '--output-format', 'json', '--print-timeout', '25s'], { windowsHide: true, timeout: 30000, maxBuffer: 1024 * 1024, cwd: home });
  } catch { throw new ProviderError('auth', m('error.agyLogin')); }
  let data; try { data = JSON.parse(output.stdout); } catch { throw new ProviderError('format', m('error.agyRead')); }
  return parseAntigravity(data);
}

async function readCredentials(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { throw new ProviderError('auth', m('error.noSession')); }
}
async function requestJson(url, options = {}, fetcher = fetch) {
  let response;
  try { response = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(15000) }); }
  catch { throw new ProviderError('network', m('error.network')); }
  if (response.status === 401) throw new ProviderError('auth', m('error.expired'));
  if (response.status === 403) throw new ProviderError('access', m('error.access'));
  if (response.status === 429) {
    const value = response.headers.get('retry-after');
    const seconds = Number(value);
    const delay = value && !Number.isFinite(seconds) ? Date.parse(value) - Date.now() : seconds * 1000;
    throw new ProviderError('limited', m('error.limited'), Math.max(300000, Math.min(3600000, delay || 0)));
  }
  if (!response.ok) throw new ProviderError('network', m('error.service'));
  try { return await response.json(); }
  catch { throw new ProviderError('format', m('error.response')); }
}

async function findCodex(home = os.homedir()) {
  const binary = await findExecutable('codex', { home });
  if (binary) return binary;
  throw new ProviderError('auth', m('error.codexInstall'));
}

async function readClaudeCredentials(home) {
  // Only the provider's own named Keychain item is requested; no Keychain enumeration.
  if (process.platform === 'darwin' && (!process.env.CLAUDE_CONFIG_DIR || process.env.NABIZ_CLAUDE_KEYCHAIN_SERVICE)) {
    try {
      const { stdout } = await execFileAsync('/usr/bin/security', ['find-generic-password', '-s', process.env.NABIZ_CLAUDE_KEYCHAIN_SERVICE || 'Claude Code-credentials', '-w'], { timeout: 15000, maxBuffer: 1024 * 1024 });
      const value = JSON.parse(stdout);
      if (value.claudeAiOauth) return value;
    } catch {}
  }
  return readCredentials(path.join(process.env.CLAUDE_CONFIG_DIR || path.join(home, '.claude'), '.credentials.json'));
}

function codexRpc(binary) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['app-server'], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let done = false, buffer = '';
    const finish = (error, value) => {
      if (done) return;
      done = true; clearTimeout(timeout); child.kill();
      error ? reject(error) : resolve(value);
    };
    const timeout = setTimeout(() => finish(new ProviderError('network', m('error.codexTimeout'))), 25000);
    const send = message => { if (!child.stdin.destroyed) child.stdin.write(JSON.stringify(message) + '\n'); };
    child.on('error', () => finish(new ProviderError('auth', m('error.codexStart'))));
    child.on('exit', () => finish(new ProviderError('network', m('error.codexClosed'))));
    child.stdin.on('error', () => finish(new ProviderError('network', m('error.codexLost'))));
    child.stderr.on('data', () => {}); // Never forward CLI diagnostics or credentials to the renderer.
    child.stdout.on('data', chunk => {
      buffer += chunk;
      if (buffer.length > 2 * 1024 * 1024) return finish(new ProviderError('format', m('error.codexRead')));
      let index;
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
        let message; try { message = JSON.parse(line); } catch { continue; }
        if (message.id === 1) {
          if (message.error) return finish(new ProviderError('auth', m('error.codexConnect')));
          send({ method: 'initialized', params: {} });
          send({ id: 2, method: 'account/rateLimits/read' });
        }
        if (message.id === 2) {
          if (message.error) return finish(new ProviderError('auth', m('error.codexLogin')));
          return finish(null, message.result);
        }
      }
    });
    send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'nabiz', title: 'Nabız', version } } });
  });
}

function createProviders({ home = os.homedir(), fetcher = fetch, getElevenKey = () => process.env.ELEVENLABS_API_KEY } = {}) {
  return {
    codex: async () => parseCodex(await codexRpc(await findCodex(home))),
    claude: async () => {
      const c = (await readClaudeCredentials(home)).claudeAiOauth;
      if (!c?.accessToken || c.expiresAt && c.expiresAt <= Date.now()) throw new ProviderError('auth', m('error.claudeLogin'));
      return parseClaude(await requestJson('https://api.anthropic.com/api/oauth/usage', { headers: { Authorization: `Bearer ${c.accessToken}`, 'anthropic-beta': 'oauth-2025-04-20', 'User-Agent': userAgent } }, fetcher), c.subscriptionType);
    },
    gemini: async () => readAntigravity(home),
    grok: async () => {
      let auth = await readCredentials(path.join(home, '.grok/auth.json'));
      const expired = Object.values(auth).some(c => c?.key && c.expires_at && Date.parse(c.expires_at) <= Date.now() + 60000);
      if (expired) {
        // Let Grok own token rotation; listing models makes no model-generation request.
        try {
          const binary = await findExecutable('grok', { home });
          if (!binary) throw new Error('Missing CLI');
          await execFileAsync(binary, ['models'], { windowsHide: true, timeout: 20000, maxBuffer: 1024 * 1024, cwd: home });
          auth = await readCredentials(path.join(home, '.grok/auth.json'));
        } catch {}
      }
      const accounts = Object.values(auth).filter(x => x && typeof x === 'object' && x.key && x.auth_mode !== 'api_key');
      if (accounts.length !== 1) throw new ProviderError('auth', accounts.length > 1 ? m('error.grokMultiple') : m('error.grokLogin'));
      const c = accounts[0];
      if (c.expires_at && Date.parse(c.expires_at) <= Date.now()) throw new ProviderError('auth', m('error.grokExpired'));
      return parseGrok(await requestJson('https://cli-chat-proxy.grok.com/v1/billing?format=credits', { headers: { Authorization: `Bearer ${c.key}`, 'X-XAI-Token-Auth': 'xai-grok-cli', 'x-userid': c.user_id || '', 'User-Agent': userAgent } }, fetcher));
    },
    elevenlabs: async () => {
      const key = getElevenKey();
      if (!key) throw new ProviderError('auth', m('error.elevenKey'));
      try {
        return parseElevenLabs(await requestJson('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': key } }, fetcher));
      } catch (error) {
        if (error.code === 'auth' || error.code === 'access') throw new ProviderError('auth', m('error.elevenAccess'));
        throw error;
      }
    },
  };
}

module.exports = { DEFINITIONS, ProviderError, percentage, iso, windowLabel, parseCodex, parseClaude, parseGemini, parseAntigravity, parseGrok, parseElevenLabs, requestJson, codexRpc, createProviders };

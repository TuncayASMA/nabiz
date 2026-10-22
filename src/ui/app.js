const $ = id => document.getElementById(id);
const icons = {
  claude: { file: 'claude-color', color: true },
  codex: { file: 'openai' },
  gemini: { file: 'gemini-color', color: true },
  grok: { file: 'grok' },
  elevenlabs: { file: 'elevenlabs' },
};
let state;
let lastCards = '';
let language;
const t = (key, params) => NabizI18n.text(language || 'en', key, params);
const locale = () => NabizI18n.locale(language);
function translatePage(nextLanguage) {
  if (language === nextLanguage) return;
  language = nextLanguage;
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n, { count: Number(element.dataset.count) });
  for (const element of document.querySelectorAll('[data-i18n-title]')) { element.title = t(element.dataset.i18nTitle); if (element.hasAttribute('aria-label')) element.setAttribute('aria-label', element.title); }
  for (const element of document.querySelectorAll('[data-i18n-label]')) element.setAttribute('aria-label', t(element.dataset.i18nLabel));
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = t(element.dataset.i18nPlaceholder);
  $('toast').hidden = true;
}
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = value => new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(value);
function age(timestamp) {
  if (!timestamp) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60000));
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { count: minutes });
  if (minutes < 1440) return t('hoursAgo', { count: Math.floor(minutes / 60) });
  return t('daysAgo', { count: Math.floor(minutes / 1440) });
}
function resetInfo(timestamp) {
  if (!timestamp) return `<span>${t('resetUnknown')}</span>`;
  const date = new Date(timestamp);
  const remaining = date - Date.now();
  const text = new Intl.DateTimeFormat(locale(), { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  if (remaining <= 0) return `<span class="elapsed">${t('awaitingReading')}</span><time title="${escapeHtml(date.toLocaleString(locale()))}">${text}</time>`;
  const minutes = Math.ceil(remaining / 60000), days = Math.floor(minutes / 1440), hours = Math.floor((minutes % 1440) / 60);
  const countdown = days ? t('durationDays', { days, hours }) : hours ? t('durationHours', { hours, minutes: minutes % 60 }) : t('durationMinutes', { minutes });
  return `<span>${t('resetsIn', { duration: countdown })}</span><time title="${escapeHtml(date.toLocaleString(locale()))}">${text}</time>`;
}
function quotaHtml(q) {
  return `<div class="quota ${q.used >= 90 ? 'critical' : q.used >= 75 ? 'warning' : ''}"><div class="quota-line"><span class="quota-label" title="${escapeHtml(q.label)}">${escapeHtml(q.label)}</span><span class="quota-value">${pct(q.used)}%<small>${t('used')}</small></span></div><div class="track" role="progressbar" aria-label="${escapeHtml(q.label)}" aria-valuenow="${Math.min(100, q.used)}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${t('percentUsed', { value: q.used })}"><div class="fill" style="--width:${Math.max(0, Math.min(100, q.used))}%"></div></div><div class="reset">${resetInfo(q.resetsAt)}</div></div>`;
}
function cardHtml(p) {
  const old = p.status === 'live' && p.updatedAt && Date.now() - Date.parse(p.updatedAt) > state.settings.intervalMinutes * 120000;
  const status = old ? 'stale' : p.status;
  const label = ({ live: t('live'), stale: t('stale'), auth: t('auth'), error: t('error'), loading: t('loading') })[status];
  let body;
  if (p.quotas.length) {
    const visibleCount = p.id === 'gemini' ? 1 : 3;
    body = p.quotas.slice(0, visibleCount).map(quotaHtml).join('');
    if (p.quotas.length > visibleCount) body += `<details class="more" data-provider="${p.id}"><summary>${t('moreQuotas', { count: p.quotas.length - visibleCount })}</summary>${p.quotas.slice(visibleCount).map(quotaHtml).join('')}</details>`;
    if (p.note && ['codex', 'elevenlabs'].includes(p.id)) body += `<p class="note">${escapeHtml(p.note)}</p>`;
    if (p.error || old) body += `<p class="card-error">${escapeHtml(p.error || t('outdatedReading'))} · ${age(p.updatedAt)}</p>`;
  } else if (status === 'loading') body = `<div class="skeleton"></div><div class="reset"><span>${t('fetchingUsage')}</span></div>`;
  else body = `<div class="error-box"><p>${escapeHtml(p.error || t('noReading'))}</p><button class="connect-button" data-login="${p.id}">${p.id === 'elevenlabs' ? t('addKey') : t('connect')} <span>↗</span></button></div>`;
  const icon = icons[p.id];
  return `<article class="provider" id="provider-${p.id}" style="--accent:${p.color}"><div class="provider-head"><span class="provider-logo"><img class="brand-image${icon.color ? '' : ' mono'}" src="logos/${icon.file}.svg" alt="" aria-hidden="true" draggable="false"></span><div class="provider-title"><h2>${p.name}<span class="plan">${escapeHtml(p.plan === p.name ? '' : p.plan)}</span></h2><p title="${escapeHtml(p.note)}">${escapeHtml(p.subtitle)}</p></div><span class="provider-status ${status}" title="${escapeHtml(age(p.updatedAt))}">${label}</span><button class="provider-link" data-open="${p.id}" title="${t('openAccount', { name: p.name })}" aria-label="${t('openAccount', { name: p.name })}">↗</button></div>${body}</article>`;
}
function render(next) {
  state = next;
  translatePage(next.settings.language);
  const cards = next.providers.map(cardHtml).join('');
  if (cards !== lastCards) {
    const opened = new Set([...document.querySelectorAll('details[open]')].map(e => e.dataset.provider));
    const focus = document.activeElement?.dataset;
    $('providers').innerHTML = cards; lastCards = cards;
    for (const d of document.querySelectorAll('details')) d.open = opened.has(d.dataset.provider);
    if (focus?.login || focus?.open) document.querySelector(focus.login ? `[data-login="${focus.login}"]` : `[data-open="${focus.open}"]`)?.focus({ preventScroll: true });
  }
  const connected = next.providers.filter(p => p.status === 'live' && Date.now() - Date.parse(p.updatedAt) <= next.settings.intervalMinutes * 120000).length;
  $('connection-count').innerHTML = `<i></i>${next.testMode ? t('demoData') : t('connectedCount', { count: connected, total: next.providers.length })}`;
  $('connection-count').classList.toggle('partial', connected < next.providers.length);
  $('key-state').textContent = next.elevenKeyPresent ? t('connected') : t('notAdded');
  $('storage-help').textContent = next.secureStorageAvailable ? t('storageHelp') : t('storageUnavailable');
  $('pin').setAttribute('aria-pressed', String(next.settings.pinned));
  $('startup').checked = next.settings.startAtLogin;
  $('interval').value = String(next.settings.intervalMinutes);
  $('language').value = next.settings.language;
  $('refresh').disabled = next.refreshing;
  $('refresh').classList.toggle('busy', next.refreshing);
  $('refresh').querySelector('span').textContent = next.refreshing ? t('refreshing') : t('refresh');
  const latest = next.providers.map(p => p.updatedAt).filter(Boolean).sort().at(-1);
  $('refresh-time').textContent = next.refreshing ? t('checking') : t('refreshTime', { age: age(latest) || t('noReadings'), minutes: next.settings.intervalMinutes });
}
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('toast').hidden = true; }, 7000); }
async function safely(action) { try { return await action(); } catch { toast(t('actionFailed')); } }
$('refresh').addEventListener('click', () => safely(async () => { render(await window.kota.refresh()); }));
$('pin').addEventListener('click', () => safely(async () => render(await window.kota.settings({ pinned: !state.settings.pinned }))));
$('hide').addEventListener('click', () => window.kota.hide());
$('quit').addEventListener('click', () => window.kota.quit());
$('settings-toggle').addEventListener('click', () => { const open = $('settings').hidden; $('settings').hidden = !open; $('settings-toggle').setAttribute('aria-expanded', String(open)); });
$('startup').addEventListener('change', () => safely(async () => render(await window.kota.settings({ startAtLogin: $('startup').checked }))));
$('interval').addEventListener('change', () => safely(async () => render(await window.kota.settings({ intervalMinutes: Number($('interval').value) }))));
$('language').addEventListener('change', () => safely(async () => render(await window.kota.settings({ language: $('language').value }))));
$('eleven-key-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('eleven-key'); const value = input.value; input.value = '';
  safely(async () => { const result = await window.kota.elevenKey(value); toast(result.ok ? t('keySaved') : result.message); });
});
$('providers').addEventListener('click', event => {
  const open = event.target.closest('[data-open]'); if (open) safely(() => window.kota.open(open.dataset.open));
  const login = event.target.closest('[data-login]'); if (login) {
    if (login.dataset.login === 'elevenlabs') { $('settings').hidden = false; $('settings-toggle').setAttribute('aria-expanded', 'true'); $('eleven-key').focus(); }
    else safely(async () => { const result = await window.kota.login(login.dataset.login); if (result?.copied) toast(t('commandCopied')); });
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!$('settings').hidden) $('settings-toggle').click(); else window.kota.hide(); } });
window.kota.onState(render);
safely(async () => render(await window.kota.get()));
setInterval(() => { if (state) render(state); }, 15000);

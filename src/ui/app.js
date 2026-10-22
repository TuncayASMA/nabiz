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
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = value => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(value);
function age(timestamp) {
  if (!timestamp) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60000));
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} sa önce`;
  return `${Math.floor(minutes / 1440)} gün önce`;
}
function resetInfo(timestamp) {
  if (!timestamp) return '<span>Sıfırlanma saati paylaşılmıyor</span>';
  const date = new Date(timestamp);
  const remaining = date - Date.now();
  const text = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  if (remaining <= 0) return `<span class="elapsed">Yeni ölçüm bekleniyor</span><time title="${escapeHtml(date.toLocaleString('tr-TR'))}">${text}</time>`;
  const minutes = Math.ceil(remaining / 60000), days = Math.floor(minutes / 1440), hours = Math.floor((minutes % 1440) / 60);
  const countdown = days ? `${days} gün ${hours} sa` : hours ? `${hours} sa ${minutes % 60} dk` : `${minutes} dk`;
  return `<span>${countdown} sonra yenilenir</span><time title="${escapeHtml(date.toLocaleString('tr-TR'))}">${text}</time>`;
}
function quotaHtml(q) {
  return `<div class="quota ${q.used >= 90 ? 'critical' : q.used >= 75 ? 'warning' : ''}"><div class="quota-line"><span class="quota-label" title="${escapeHtml(q.label)}">${escapeHtml(q.label)}</span><span class="quota-value">${pct(q.used)}%<small>kullanıldı</small></span></div><div class="track" role="progressbar" aria-label="${escapeHtml(q.label)}" aria-valuenow="${Math.min(100, q.used)}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Yüzde ${pct(q.used)} kullanıldı"><div class="fill" style="--width:${Math.max(0, Math.min(100, q.used))}%"></div></div><div class="reset">${resetInfo(q.resetsAt)}</div></div>`;
}
function cardHtml(p) {
  const old = p.status === 'live' && p.updatedAt && Date.now() - Date.parse(p.updatedAt) > state.settings.intervalMinutes * 120000;
  const status = old ? 'stale' : p.status;
  const label = ({ live: 'Canlı', stale: 'Eski ölçüm', auth: 'Giriş gerekli', error: 'Bağlantı yok', loading: 'Bağlanıyor' })[status];
  let body;
  if (p.quotas.length) {
    const visibleCount = p.id === 'gemini' ? 1 : 3;
    body = p.quotas.slice(0, visibleCount).map(quotaHtml).join('');
    if (p.quotas.length > visibleCount) body += `<details class="more" data-provider="${p.id}"><summary>${p.quotas.length - visibleCount} kota daha</summary>${p.quotas.slice(visibleCount).map(quotaHtml).join('')}</details>`;
    if (p.note && ['codex', 'elevenlabs'].includes(p.id)) body += `<p class="note">${escapeHtml(p.note)}</p>`;
    if (p.error || old) body += `<p class="card-error">${escapeHtml(p.error || 'Ölçüm güncelliğini yitirdi.')} · ${age(p.updatedAt)}</p>`;
  } else if (status === 'loading') body = '<div class="skeleton"></div><div class="reset"><span>Kota bilgisi alınıyor</span></div>';
  else body = `<div class="error-box"><p>${escapeHtml(p.error || 'Kota bilgisi henüz alınamadı.')}</p><button class="connect-button" data-login="${p.id}">${p.id === 'elevenlabs' ? 'API anahtarı ekle' : 'Hesabı bağla'} <span>↗</span></button></div>`;
  const icon = icons[p.id];
  return `<article class="provider" id="provider-${p.id}" style="--accent:${p.color}"><div class="provider-head"><span class="provider-logo"><img class="brand-image${icon.color ? '' : ' mono'}" src="logos/${icon.file}.svg" alt="" aria-hidden="true" draggable="false"></span><div class="provider-title"><h2>${p.name}<span class="plan">${escapeHtml(p.plan === p.name ? '' : p.plan)}</span></h2><p title="${escapeHtml(p.note)}">${escapeHtml(p.subtitle)}</p></div><span class="provider-status ${status}" title="${escapeHtml(age(p.updatedAt))}">${label}</span><button class="provider-link" data-open="${p.id}" title="${p.name} hesabını aç" aria-label="${p.name} hesabını aç">↗</button></div>${body}</article>`;
}
function render(next) {
  state = next;
  const cards = next.providers.map(cardHtml).join('');
  if (cards !== lastCards) {
    const opened = new Set([...document.querySelectorAll('details[open]')].map(e => e.dataset.provider));
    const focus = document.activeElement?.dataset;
    $('providers').innerHTML = cards; lastCards = cards;
    for (const d of document.querySelectorAll('details')) d.open = opened.has(d.dataset.provider);
    if (focus?.login || focus?.open) document.querySelector(focus.login ? `[data-login="${focus.login}"]` : `[data-open="${focus.open}"]`)?.focus({ preventScroll: true });
  }
  const connected = next.providers.filter(p => p.status === 'live' && Date.now() - Date.parse(p.updatedAt) <= next.settings.intervalMinutes * 120000).length;
  $('connection-count').innerHTML = `<i></i>${next.testMode ? 'TEST VERİSİ' : `${connected} / ${next.providers.length} bağlı`}`;
  $('connection-count').classList.toggle('partial', connected < next.providers.length);
  $('key-state').textContent = next.elevenKeyPresent ? 'Bağlı' : 'Eklenmedi';
  $('storage-help').textContent = next.secureStorageAvailable ? 'Sistem anahtarlığı ile şifrelenir. Yalnızca kullanım bilgisi okunur.' : 'Güvenli anahtarlık bulunamadı. Anahtar diske kaydedilmez; sistem anahtarlığını etkinleştir veya ortam değişkenini kullan.';
  $('pin').setAttribute('aria-pressed', String(next.settings.pinned));
  $('startup').checked = next.settings.startAtLogin;
  $('interval').value = String(next.settings.intervalMinutes);
  $('refresh').disabled = next.refreshing;
  $('refresh').classList.toggle('busy', next.refreshing);
  $('refresh').querySelector('span').textContent = next.refreshing ? 'Yenileniyor' : 'Yenile';
  const latest = next.providers.map(p => p.updatedAt).filter(Boolean).sort().at(-1);
  $('refresh-time').textContent = next.refreshing ? 'Hesaplar kontrol ediliyor' : `${age(latest) || 'Henüz ölçüm yok'} · ${next.settings.intervalMinutes} dk aralıkla`;
}
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('toast').hidden = true; }, 7000); }
async function safely(action) { try { return await action(); } catch { toast('İşlem tamamlanamadı. Yeniden deneyebilirsin.'); } }
$('refresh').addEventListener('click', () => safely(async () => { render(await window.kota.refresh()); }));
$('pin').addEventListener('click', () => safely(async () => render(await window.kota.settings({ pinned: !state.settings.pinned }))));
$('hide').addEventListener('click', () => window.kota.hide());
$('quit').addEventListener('click', () => window.kota.quit());
$('settings-toggle').addEventListener('click', () => { const open = $('settings').hidden; $('settings').hidden = !open; $('settings-toggle').setAttribute('aria-expanded', String(open)); });
$('startup').addEventListener('change', () => safely(async () => render(await window.kota.settings({ startAtLogin: $('startup').checked }))));
$('interval').addEventListener('change', () => safely(async () => render(await window.kota.settings({ intervalMinutes: Number($('interval').value) }))));
$('eleven-key-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('eleven-key'); const value = input.value; input.value = '';
  safely(async () => { const result = await window.kota.elevenKey(value); toast(result.ok ? 'ElevenLabs bağlantısı kaydedildi.' : result.message); });
});
$('providers').addEventListener('click', event => {
  const open = event.target.closest('[data-open]'); if (open) safely(() => window.kota.open(open.dataset.open));
  const login = event.target.closest('[data-login]'); if (login) {
    if (login.dataset.login === 'elevenlabs') { $('settings').hidden = false; $('settings-toggle').setAttribute('aria-expanded', 'true'); $('eleven-key').focus(); }
    else safely(async () => { const result = await window.kota.login(login.dataset.login); if (result?.copied) toast('Komut kopyalandı. Terminalde çalıştırıp giriş yaptıktan sonra Yenile’ye bas.'); });
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!$('settings').hidden) $('settings-toggle').click(); else window.kota.hide(); } });
window.kota.onState(render);
safely(async () => render(await window.kota.get()));
setInterval(() => { if (state) render(state); }, 15000);

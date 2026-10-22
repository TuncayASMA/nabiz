const fs = require('node:fs');
const path = require('node:path');
const { DEFINITIONS, ProviderError } = require('./providers.cjs');

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temp, file);
}
function retainReading(previous, error, now) {
  const safe = error instanceof ProviderError ? error : new ProviderError('network', 'Veri alınamadı. Tekrar denenecek.');
  // An authentication change must not leave another account's readings visible.
  const old = safe.code === 'auth' || safe.code === 'access' ? null : previous;
  return { ...(old || { quotas: [], updatedAt: null }), status: old?.updatedAt ? 'stale' : safe.code === 'auth' ? 'auth' : 'error', error: safe.message, checkedAt: now };
}
class UsageStore {
  constructor(providers, cacheFile, onUpdate = () => {}) {
    this.providers = providers; this.cacheFile = cacheFile; this.onUpdate = onUpdate;
    this.state = {}; this.nextAllowed = {}; this.failures = {}; this.active = null;
    const cache = readJson(cacheFile, {});
    for (const { id } of DEFINITIONS) {
      const c = cache[id];
      this.state[id] = c && Array.isArray(c.quotas) && c.updatedAt ? { ...c, status: 'stale', error: 'Son ölçüm · güncelleniyor' } : { quotas: [], status: 'loading', updatedAt: null };
    }
  }
  snapshot() { return DEFINITIONS.map(d => ({ ...d, ...this.state[d.id] })); }
  refresh() {
    if (this.active) return this.active;
    this.active = this.run().finally(() => { this.active = null; this.onUpdate(); });
    this.onUpdate();
    return this.active;
  }
  async run() {
    await Promise.all(DEFINITIONS.map(async ({ id }) => {
      if (this.nextAllowed[id] > Date.now()) return;
      try {
        const reading = await this.providers[id]();
        this.state[id] = { ...reading, updatedAt: new Date().toISOString(), status: 'live', error: null };
        this.failures[id] = 0; this.nextAllowed[id] = Date.now() + 60000;
      } catch (error) {
        this.state[id] = retainReading(this.state[id], error, new Date().toISOString());
        this.failures[id] = (this.failures[id] || 0) + 1;
        this.nextAllowed[id] = Date.now() + Math.max(error.retryAfter || 0, Math.min(1800000, 60000 * 2 ** (this.failures[id] - 1)));
      }
      this.onUpdate();
    }));
    // Only sanitized readings are persisted; credentials and raw API responses never enter this cache.
    try { writeJson(this.cacheFile, this.state); } catch { this.persistenceError = true; }
  }
}
module.exports = { readJson, writeJson, retainReading, UsageStore };

const fs = require('node:fs');
const path = require('node:path');

function createSecretStore(safeStorage, directory, { platform = process.platform, env = process.env } = {}) {
  const file = path.join(directory, 'elevenlabs-key.enc');
  const secure = () => safeStorage.isEncryptionAvailable() && (platform !== 'linux' || ['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6'].includes(safeStorage.getSelectedStorageBackend?.() ?? safeStorage.getSelectedLinuxBackend?.()));
  return {
    available: secure,
    get() {
      if (!secure()) return env.ELEVENLABS_API_KEY || null;
      try { return safeStorage.decryptString(fs.readFileSync(file)); }
      catch { return env.ELEVENLABS_API_KEY || null; }
    },
    set(key) {
      if (typeof key !== 'string' || key.trim().length < 16 || key.length > 512 || /\s/.test(key.trim())) throw new Error('Geçerli bir API anahtarı gir.');
      if (!secure()) throw new Error('Sistem anahtarlığı kullanılamıyor.');
      fs.mkdirSync(directory, { recursive: true });
      const temp = file + '.tmp';
      fs.writeFileSync(temp, safeStorage.encryptString(key.trim()), { mode: 0o600 });
      fs.renameSync(temp, file);
    },
    importEnvironment() {
      if (!fs.existsSync(file) && env.ELEVENLABS_API_KEY && secure()) this.set(env.ELEVENLABS_API_KEY);
    },
  };
}
module.exports = { createSecretStore };

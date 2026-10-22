const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { executableCandidates, findExecutable, setAutoStart, desktopExec } = require('../src/platform.cjs');
const { createSecretStore } = require('../src/secrets.cjs');

test('CLI discovery handles Windows ARM64 npm, macOS Homebrew, Linux and explicit paths', () => {
  const windows = executableCandidates('codex', { platform: 'win32', arch: 'arm64', home: 'C:\\Users\\example', env: { APPDATA: 'C:\\Users\\example\\AppData\\Roaming', PATH: 'C:\\Tools;relative' } });
  assert.ok(windows.some(p => p.includes('codex-win32-arm64') && p.includes('aarch64-pc-windows-msvc')));
  assert.ok(windows.includes('C:\\Tools\\codex.exe'));
  const mac = executableCandidates('agy', { platform: 'darwin', home: '/Users/example', env: {} });
  assert.ok(mac.includes('/opt/homebrew/bin/agy'));
  assert.ok(mac.includes('/Users/example/.local/bin/agy'));
  const linux = executableCandidates('grok', { platform: 'linux', home: '/home/example', env: { NABIZ_GROK_PATH: '/opt/tools/grok', PATH: '/usr/bin:.' } });
  assert.equal(linux[0], '/opt/tools/grok');
  assert.ok(linux.includes('/home/example/.grok/bin/grok'));
  assert.ok(linux.every(p => p.startsWith('/')));
});

test('CLI discovery rejects directories and picks the actual executable', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nabiz-find-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const executable = path.join(dir, process.platform === 'win32' ? 'agy.exe' : 'agy');
  fs.writeFileSync(executable, '', { mode: 0o700 });
  assert.equal(await findExecutable('agy', { home: dir, env: { PATH: dir, NABIZ_AGY_PATH: dir } }), executable);
});

test('Linux autostart uses the persistent AppImage and removes only its own entry', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nabiz-startup-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const options = { platform: 'linux', home: dir, env: { XDG_CONFIG_HOME: dir, APPIMAGE: '/home/example/My Apps/Nabiz.AppImage' } };
  setAutoStart({ isPackaged: true }, true, options);
  const file = path.join(dir, 'autostart/nabiz.desktop');
  assert.match(fs.readFileSync(file, 'utf8'), /Exec="\/home\/example\/My Apps\/Nabiz.AppImage" "--background"/);
  fs.writeFileSync(path.join(dir, 'autostart/other.desktop'), 'keep');
  setAutoStart({ isPackaged: true }, false, options);
  assert.equal(fs.existsSync(file), false);
  assert.equal(fs.existsSync(path.join(dir, 'autostart/other.desktop')), true);
  assert.throws(() => desktopExec('/tmp/bad\npath'));
  assert.match(desktopExec('/tmp/100% app'), /100%% app/);
});

test('Windows/macOS startup uses Electron with packaged/development arguments', () => {
  let value;
  const app = { isPackaged: true, setLoginItemSettings: v => { value = v; } };
  setAutoStart(app, true, { platform: 'win32', executable: 'C:\\Apps\\Nabiz.exe' });
  assert.deepEqual(value, { openAtLogin: true, path: 'C:\\Apps\\Nabiz.exe', args: ['--background'] });
  setAutoStart({ ...app, isPackaged: false, getAppPath: () => '/app' }, false, { platform: 'darwin', executable: '/electron' });
  assert.deepEqual(value.args, ['/app', '--background']);
  assert.equal(value.openAtLogin, false);
});

test('No Linux basic_text encryption fallback can persist a key', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nabiz-secret-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const key = 'fictional-value-for-unit-test';
  const unsafe = createSecretStore({ isEncryptionAvailable: () => true, getSelectedStorageBackend: () => 'basic_text', encryptString: () => { throw Error('must not run'); } }, dir, { platform: 'linux', env: { ELEVENLABS_API_KEY: key } });
  assert.equal(unsafe.available(), false);
  assert.throws(() => unsafe.set(key));
  unsafe.importEnvironment();
  assert.deepEqual(fs.readdirSync(dir), []);
  assert.equal(unsafe.get(), key); // Caller-owned environment value stays in memory.
});

test('Secure storage writes ciphertext and retrieves it without exposing a raw file', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nabiz-encrypted-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const key = 'fictional-value-for-unit-test';
  const storage = createSecretStore({ isEncryptionAvailable: () => true, encryptString: () => Buffer.from('ciphertext-fixture'), decryptString: bytes => { assert.equal(bytes.toString(), 'ciphertext-fixture'); return key; } }, dir, { platform: 'darwin', env: {} });
  storage.set(key);
  assert.equal(storage.get(), key);
  assert.equal(fs.readFileSync(path.join(dir, 'elevenlabs-key.enc')).includes(Buffer.from(key)), false);
});

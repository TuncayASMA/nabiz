const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, shell, powerMonitor, net, safeStorage, dialog, clipboard } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { DEFINITIONS, createProviders } = require('./providers.cjs');
const { UsageStore, readJson, writeJson } = require('./store.cjs');
const { createSecretStore } = require('./secrets.cjs');
const { setAutoStart } = require('./platform.cjs');
const { sampleProviders } = require('./demo.cjs');
const i18n = require('./ui/i18n.js');
const t = (key, params) => i18n.text(settings?.language || 'en', key, params);

const testMode = process.argv.includes('--smoke') || process.argv.includes('--demo');
const dataArg = process.argv.find(a => a.startsWith('--data-dir='));
// Preserve the initial Windows release's existing settings, but use Nabiz for new installations.
const legacyDirectory = path.join(app.getPath('appData'), 'Kota');
const legacy = process.platform === 'win32' && fs.existsSync(path.join(legacyDirectory, 'settings.json'));
const dataDirectory = dataArg ? dataArg.slice('--data-dir='.length) : testMode ? path.join(app.getPath('temp'), 'nabiz-demo') : legacy ? legacyDirectory : path.join(app.getPath('appData'), 'Nabiz');
app.setPath('userData', dataDirectory);
app.setName('Nabız');
app.setAppUserModelId(legacy ? 'com.tuncay.kota' : 'io.github.nabiz.app');
let win, tray, usage, timer, settings, settingsFile, secrets, quitting = false;
const entry = path.join(__dirname, 'ui/index.html');
const entryUrl = pathToFileURL(entry).href;

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });
  app.whenReady().then(start).catch(() => app.quit());
}
function snapshot() {
  return { providers: usage.snapshot().map(p => i18n.provider(settings.language, p)), refreshing: Boolean(usage.active), settings, persistenceError: Boolean(usage.persistenceError), elevenKeyPresent: !testMode && Boolean(secrets?.get()), secureStorageAvailable: testMode || Boolean(secrets?.available()), testMode };
}
function emit() {
  if (win && !win.isDestroyed() && usage) win.webContents.send('kota:state', snapshot());
  if (tray && usage) {
    const lines = usage.snapshot().map(p => `${p.name}: ${p.quotas.length ? Math.round(p.quotas[0].used) + '%' + (p.status === 'live' ? '' : ` (${t('trayStale')})`) : t('notConnected')}`);
    tray.setToolTip(['Nabız', ...lines].join('\n').slice(0, 127));
  }
}
function saveSettings() { writeJson(settingsFile, settings); }
function autostart(enabled) {
  if (!testMode) setAutoStart(app, enabled);
}
function setSettings(patch) {
  if (i18n.supported.includes(patch.language)) settings.language = patch.language;
  if (typeof patch.pinned === 'boolean') { settings.pinned = patch.pinned; win.setAlwaysOnTop(settings.pinned); }
  if (typeof patch.startAtLogin === 'boolean') { autostart(patch.startAtLogin); settings.startAtLogin = patch.startAtLogin; }
  if ([2, 5, 10, 15].includes(patch.intervalMinutes)) { settings.intervalMinutes = patch.intervalMinutes; schedule(); }
  saveSettings(); emit(); trayMenu(); return snapshot();
}
function schedule() {
  clearInterval(timer);
  timer = setInterval(() => usage.refresh(), settings.intervalMinutes * 60000);
}
function trayMenu() {
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: t('trayOpen'), click: () => { win.show(); win.focus(); } },
    { label: t('refreshNow'), click: () => usage.refresh() },
    { type: 'separator' },
    { label: t('pin'), type: 'checkbox', checked: settings.pinned, click: item => setSettings({ pinned: item.checked }) },
    { label: t('startup'), type: 'checkbox', checked: settings.startAtLogin, click: item => setSettings({ startAtLogin: item.checked }) },
    { type: 'separator' },
    { label: t('quit'), click: () => app.quit() },
  ]));
}
function trusted(event) { return event.senderFrame?.url === entryUrl; }
function handle(channel, fn) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!trusted(event)) throw new Error('Invalid source.');
    return fn(...args);
  });
}
async function start() {
  settingsFile = path.join(app.getPath('userData'), 'settings.json');
  secrets = createSecretStore(safeStorage, app.getPath('userData'), testMode ? { env: {} } : {});
  if (!testMode) { try { secrets.importEnvironment(); } catch {} }
  const saved = readJson(settingsFile, {});
  settings = { pinned: saved.pinned !== false, startAtLogin: saved.startAtLogin === true, intervalMinutes: [2, 5, 10, 15].includes(saved.intervalMinutes) ? saved.intervalMinutes : 5, position: saved.position || null, language: i18n.initialLanguage(saved, app.getPreferredSystemLanguages()[0] || app.getLocale()) };
  try { saveSettings(); } catch {}
  const work = screen.getPrimaryDisplay().workArea;
  const width = Math.min(420, work.width), height = Math.min(880, work.height - 24);
  const desired = settings.position;
  const display = desired && Number.isFinite(desired.x) && Number.isFinite(desired.y) ? screen.getDisplayNearestPoint(desired) : null;
  const area = display?.workArea || work;
  const x = Math.round(Math.max(area.x, Math.min(desired?.x ?? area.x + area.width - width - 20, area.x + area.width - width)));
  const y = Math.round(Math.max(area.y, Math.min(desired?.y ?? area.y + area.height - height - 16, area.y + area.height - height)));
  win = new BrowserWindow({ width, height, x, y, minWidth: 360, minHeight: 480, frame: false, transparent: true, backgroundColor: '#00000000', show: false, resizable: true, maximizable: false, skipTaskbar: process.platform !== 'linux', alwaysOnTop: settings.pinned, title: 'Nabız', icon: path.join(__dirname, '../assets/kota.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: !app.isPackaged } });
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => { if (url !== entryUrl) event.preventDefault(); });
  win.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  win.on('close', event => { if (!quitting) { event.preventDefault(); win.hide(); } });
  win.on('blur', () => { if (!settings.pinned) win.hide(); });
  win.on('moved', () => { const [x, y] = win.getPosition(); settings.position = { x, y }; try { saveSettings(); } catch {} });
  const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/kota.png'));
  tray = new Tray(icon.resize({ width: 24, height: 24 }));
  tray.on('click', () => { if (win.isVisible()) win.hide(); else { win.show(); win.focus(); } });
  trayMenu();
  usage = new UsageStore(testMode ? sampleProviders() : createProviders({ fetcher: (url, options) => net.fetch(url, options), getElevenKey: () => secrets.get() }), path.join(app.getPath('userData'), 'usage-cache.json'), emit);
  handle('kota:get', () => snapshot());
  handle('kota:refresh', async () => { await usage.refresh(); return snapshot(); });
  handle('kota:settings', patch => setSettings(patch || {}));
  handle('kota:eleven-key', async key => {
    if (testMode) return { ok: true };
    if (!secrets.available()) return { ok: false, message: t('noKeyring') };
    try {
      secrets.set(key);
      if (usage.active) await usage.active;
      usage.nextAllowed.elevenlabs = 0;
      usage.state.elevenlabs = { quotas: [], updatedAt: null, status: 'loading' };
      await usage.refresh();
      return { ok: usage.state.elevenlabs.status === 'live', message: i18n.resolve(settings.language, usage.state.elevenlabs.error) };
    } catch { return { ok: false, message: t('keyFailed') }; }
  });
  handle('kota:hide', () => win.hide());
  handle('kota:quit', () => app.quit());
  handle('kota:open', id => { const provider = DEFINITIONS.find(p => p.id === id); if (provider && !testMode) return shell.openExternal(provider.url); });
  handle('kota:login', async id => {
    const provider = DEFINITIONS.find(p => p.id === id);
    if (!provider?.login || testMode) return;
    const result = await dialog.showMessageBox(win, { type: 'info', title: t('loginTitle', { name: provider.name }), message: t('loginMessage'), detail: t('loginDetail', { command: provider.login }), buttons: [t('copyCommand'), t('setupGuide'), t('close')], defaultId: 0, cancelId: 2, noLink: true });
    if (result.response === 0) clipboard.writeText(provider.login);
    if (result.response === 1) await shell.openExternal(`https://github.com/TuncayASMA/nabiz/blob/main/docs/SETUP${settings.language === 'tr' ? '.tr' : ''}.md#${id}`);
    usage.nextAllowed[id] = 0;
    return { copied: result.response === 0 };
  });
  await win.loadFile(entry);
  if (!process.argv.includes('--background')) win.show();
  schedule(); usage.refresh();
  powerMonitor.on('resume', () => usage.refresh());
}
app.on('before-quit', () => { quitting = true; clearInterval(timer); });
app.on('window-all-closed', () => { if (quitting) app.quit(); });
app.on('activate', () => { if (win) { win.show(); win.focus(); } });

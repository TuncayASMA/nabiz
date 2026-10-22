const { _electron: electron } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const live = process.argv.includes('--live');
  const packaged = process.argv.includes('--packaged');
  const release = process.argv.includes('--release') || packaged;
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'kota-ui-'));
  fs.mkdirSync('artifacts', { recursive: true });
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  function findReleaseExecutable(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isFile() && (process.platform === 'win32' ? entry.name === 'Nabiz.exe' : ['Nabiz', 'Nabız'].includes(entry.name))) return path.resolve(file);
      if (entry.isDirectory()) { const found = findReleaseExecutable(file); if (found) return found; }
    }
  }
  const executablePath = release ? findReleaseExecutable('release') : null;
  if (release && !executablePath) throw new Error('Packaged executable not found');
  const app = await electron.launch({ ...(executablePath ? { executablePath } : {}), args: [...(executablePath ? [] : ['.']), ...(live ? [] : ['--smoke']), `--data-dir=${data}`], env });
  try {
    const page = await app.firstWindow();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.waitForSelector('.provider');
    await page.waitForFunction(() => !document.getElementById('refresh').disabled, null, { timeout: 60000 });
    assert.equal(await page.locator('.provider').count(), 5);
    assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
    assert.equal(await page.evaluate(() => typeof window.process), 'undefined');
    const summary = await page.evaluate(async () => (await window.kota.get()).providers.map(p => ({ id: p.id, status: p.status, quotas: p.quotas, error: p.error })));
    if (live && process.env.ELEVENLABS_API_KEY) {
      const bytes = fs.readFileSync(path.join(data, 'elevenlabs-key.enc'));
      const matches = await app.evaluate(({ safeStorage }, encoded) => safeStorage.decryptString(Buffer.from(encoded, 'base64')) === process.env.ELEVENLABS_API_KEY, bytes.toString('base64'));
      const storage = { encrypted: !bytes.includes(Buffer.from(process.env.ELEVENLABS_API_KEY)), matches };
      assert.deepEqual(storage, { encrypted: true, matches: true });
      assert.equal((await page.content()).includes(process.env.ELEVENLABS_API_KEY), false);
    }
    if (!live) {
      assert.ok(summary.every(p => p.status === 'live'));
      await page.locator('#pin').click();
      assert.equal(await page.locator('#pin').getAttribute('aria-pressed'), 'false');
      await page.locator('#pin').click();
      assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isAlwaysOnTop()), true);
      await page.locator('#settings-toggle').click();
      await page.locator('#interval').selectOption('2');
      assert.equal(await page.evaluate(async () => (await window.kota.get()).settings.intervalMinutes), 2);
      await page.locator('#startup').check();
      assert.equal(await page.evaluate(async () => (await window.kota.get()).settings.startAtLogin), true);
      await page.locator('#settings-toggle').click();
      await page.locator('#refresh').click();
      await page.waitForFunction(() => !document.getElementById('refresh').disabled);
    }
    await page.screenshot({ path: `artifacts/${live ? 'live' : 'widget'}.png` });
    const layout = await page.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > innerWidth, cardsVisible: [...document.querySelectorAll('.provider')].every(p => p.getBoundingClientRect().bottom <= document.querySelector('footer').getBoundingClientRect().top) }));
    assert.equal(layout.horizontalOverflow, false);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ mode: live ? 'live' : 'fixture', summary, layout, errors }, null, 2));
    await page.locator('#hide').click();
    assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), false);
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].show());
    await page.locator('#settings-toggle').click();
    await page.locator('#quit').click();
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    await app.close().catch(() => {});
    if (path.dirname(path.resolve(data)) !== path.resolve(os.tmpdir()) || !path.basename(data).startsWith('kota-ui-')) throw new Error('Unsafe cleanup path');
    fs.rmSync(data, { recursive: true, force: true });
  }
})().catch(e => { console.error(e); process.exitCode = 1; });

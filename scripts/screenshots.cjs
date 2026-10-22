const { _electron: electron } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nabiz-media-'));
  const output = path.resolve('docs/images');
  fs.mkdirSync(output, { recursive: true });
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.ELEVENLABS_API_KEY;
  const app = await electron.launch({ args: ['.', '--smoke', `--data-dir=${directory}`], env });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelectorAll('.provider').length === 5 && !document.getElementById('refresh').disabled);
    assert.equal(await page.evaluate(async () => (await window.kota.get()).testMode), true);
    assert.equal(await page.evaluate(async () => (await window.kota.get()).elevenKeyPresent), false);
    await page.screenshot({ path: path.join(output, 'overview.png'), scale: 'css' });
    await page.locator('#settings-toggle').click();
    await page.locator('#settings').screenshot({ path: path.join(output, 'settings.png'), scale: 'css' });
    const screenshot = fs.readFileSync(path.join(output, 'overview.png')).toString('base64');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1440, 960));
    await page.setContent(`<!doctype html><html><head><style>
      *{box-sizing:border-box}body{margin:0;background:#111218;color:#f3f1fa;font-family:'Segoe UI',Arial,sans-serif;width:1440px;height:960px;overflow:hidden}
      .halo{position:absolute;width:850px;height:850px;right:-100px;top:-100px;background:radial-gradient(ellipse,#6f58ab40,transparent 65%)}
      .copy{position:absolute;left:92px;top:135px;width:680px}.eyebrow{color:#b4a4e3;font-size:16px;letter-spacing:4px;font-weight:600}.brand{font-size:78px;font-weight:680;letter-spacing:-4px;margin:32px 0 30px}.brand span{color:#bdabf4}h1{font-size:55px;letter-spacing:-1.5px;line-height:1.13;font-weight:600;margin:0 0 25px}p{font-size:22px;line-height:1.6;color:#a5a4b7;max-width:540px}.chips{display:flex;gap:12px;margin:38px 0 70px}.chips span{border:1px solid #ffffff22;border-radius:22px;padding:9px 18px;color:#c5bfd4;font-size:15px}.features{font-size:18px;color:#c7bfd8;line-height:2}.foot{position:absolute;left:92px;bottom:60px;color:#777487;font-size:14px}.app{position:absolute;right:110px;top:40px;height:880px;width:420px;filter:drop-shadow(0 24px 45px #0007)}
      </style></head><body><div class="halo"></div><div class="copy"><div class="eyebrow">OPEN SOURCE · LOCAL FIRST</div><div class="brand">Nabız<span>.</span></div><h1>Your AI usage.<br>One quiet place.</h1><p>Five services, reset times and remaining capacity — right on your desktop.</p><div class="chips"><span>Windows</span><span>macOS</span><span>Linux</span></div><div class="features">Claude · ChatGPT / Codex · Gemini<br>Grok · ElevenLabs</div></div><img class="app" src="data:image/png;base64,${screenshot}" alt="Nabız sample dashboard"><div class="foot">Fictional demo data · Turkish interface · No account included</div></body></html>`);
    await page.locator('.app').evaluate(img => img.decode());
    await page.screenshot({ path: path.join(output, 'preview.png'), scale: 'css' });
    console.log('Created public screenshots with synthetic data only.');
  } finally {
    await app.close();
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith('nabiz-media-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });

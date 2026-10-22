const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function executableCandidates(tool, { home = os.homedir(), env = process.env, platform = process.platform, arch = process.arch } = {}) {
  if (!['codex', 'agy', 'grok'].includes(tool)) throw new Error('Unknown CLI');
  const p = platform === 'win32' ? path.win32 : path.posix;
  const dirs = (env.PATH || '').split(platform === 'win32' ? ';' : ':').filter(d => p.isAbsolute(d));
  const name = tool + (platform === 'win32' ? '.exe' : '');
  const candidates = [env[`NABIZ_${tool.toUpperCase()}_PATH`]];
  if (tool === 'codex') candidates.push(env.KOTA_CODEX_PATH);
  if (platform === 'win32') {
    const local = env.LOCALAPPDATA || p.join(home, 'AppData', 'Local');
    if (tool === 'agy') candidates.push(p.join(local, 'agy', 'bin', name));
    if (tool === 'codex') {
      const triple = arch === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc';
      const roots = [p.join(env.APPDATA || p.join(home, 'AppData', 'Roaming'), 'npm'), ...dirs];
      for (const root of roots) {
        const npm = p.join(root, 'node_modules', '@openai', 'codex');
        for (const base of [p.join(npm, 'node_modules', '@openai', `codex-win32-${arch}`), npm]) {
          candidates.push(p.join(base, 'vendor', triple, 'bin', name), p.join(base, 'vendor', triple, 'codex', name));
        }
      }
    }
  } else dirs.push('/opt/homebrew/bin', '/usr/local/bin', '/usr/bin');
  candidates.push(p.join(home, '.local', 'bin', name));
  if (tool === 'grok') candidates.push(p.join(home, '.grok', 'bin', name));
  candidates.push(...dirs.map(dir => p.join(dir, name)));
  return [...new Set(candidates.filter(candidate => candidate && p.isAbsolute(candidate)))];
}

async function findExecutable(tool, options) {
  for (const file of executableCandidates(tool, options)) {
    try {
      await fs.promises.access(file, process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK);
      if ((await fs.promises.stat(file)).isFile()) return file;
    } catch {}
  }
  return null;
}

function desktopExec(executable, args = []) {
  return [executable, ...args].map(value => {
    if (/[\r\n\0]/.test(value)) throw new Error('Invalid startup path');
    return '"' + value.replace(/%/g, '%%').replace(/[\\`"$]/g, '\\$&') + '"';
  }).join(' ');
}

function setAutoStart(app, enabled, { platform = process.platform, env = process.env, home = os.homedir(), executable = process.execPath } = {}) {
  const args = app.isPackaged ? ['--background'] : [app.getAppPath(), '--background'];
  if (platform !== 'linux') {
    app.setLoginItemSettings({ openAtLogin: enabled, path: executable, args });
    return;
  }
  const config = env.XDG_CONFIG_HOME && path.isAbsolute(env.XDG_CONFIG_HOME) ? env.XDG_CONFIG_HOME : path.join(home, '.config');
  const file = path.join(config, 'autostart', 'nabiz.desktop');
  if (!enabled) { fs.rmSync(file, { force: true }); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  // APPIMAGE survives moves across launches; process.execPath is a temporary mount inside AppImage.
  const target = app.isPackaged && env.APPIMAGE ? env.APPIMAGE : executable;
  fs.writeFileSync(file, `[Desktop Entry]\nType=Application\nName=Nabız\nExec=${desktopExec(target, args)}\nTerminal=false\nX-GNOME-Autostart-enabled=true\n`, { mode: 0o600 });
}

module.exports = { executableCandidates, findExecutable, desktopExec, setAutoStart };

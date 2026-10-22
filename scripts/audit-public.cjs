const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const forbiddenPath = /(^|\/)(DURUM\.md|AGENTS\.md|CLAUDE\.md|artifacts|dist|release|\.env[^/]*|\.codex|\.claude|\.gemini|\.grok)(\/|$)|(?:^|\/)(?:auth|.*credentials.*|settings|usage-cache)\.json$|\.(?:enc|pem|pfx|p12|key)$/i;
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['provider token', /\b(?:sk-(?:ant-|proj-)?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AIza[A-Za-z0-9_-]{30,}|GOCSPX-[A-Za-z0-9_-]{20,})\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/],
  ['personal machine path', /(?:C:[\\/]+Users[\\/]+tunca\b|\/Users\/tunca\b|\/home\/tunca\b)/i],
  ['literal credential', /(?:access_token|refresh_token|api_key|accessToken|client_secret)\s*["']?\s*[:=]\s*["'][A-Za-z0-9_.-]{24,}["']/],
];
let checked = 0;
const findings = [];
function inspect(name, bytes) {
  checked++;
  if (forbiddenPath.test(name)) findings.push(`${name}: excluded private file`);
  if (!/\.(?:png|ico|icns)$/i.test(name)) {
    const content = bytes.toString('utf8');
    for (const [label, pattern] of patterns) if (pattern.test(content)) findings.push(`${name}: ${label}`);
  }
}
const archive = process.argv.find(a => a.startsWith('--asar='))?.slice(7);
if (archive) {
  const asar = require('@electron/asar');
  for (const entry of asar.listPackage(archive)) {
    const internal = entry.replace(/^[\\/]+/, '');
    const name = internal.replaceAll('\\', '/');
    const stat = asar.statFile(archive, internal);
    if (stat.files) continue;
    if (stat.link) throw new Error(`Unexpected link in archive: ${name}`);
    if (!/^(src\/|assets\/(kota\.png|kota\.ico)$|package\.json$|LICENSE$|THIRD_PARTY_NOTICES\.md$)/.test(name)) findings.push(`${name}: unexpected packaged file`);
    inspect(name, asar.extractFile(archive, internal));
  }
} else {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  if (!files.length) throw new Error('No public files found');
  for (const name of new Set(files)) {
    const file = path.resolve(name);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Refusing symlink: ${name}`);
    inspect(name, fs.readFileSync(file));
  }
}
if (findings.length) {
  // Report filenames and rule names, never the suspected secret itself.
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else console.log(`Public-content audit passed: ${checked} files${archive ? ' inside app.asar' : ''}.`);

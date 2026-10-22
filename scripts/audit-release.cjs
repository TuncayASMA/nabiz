const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
function archives(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? archives(file) : entry.name === 'app.asar' ? [file] : [];
  });
}
const files = archives('release');
if (!files.length) throw new Error('No packaged app.asar to audit');
for (const file of files) execFileSync(process.execPath, ['scripts/audit-public.cjs', `--asar=${file}`], { stdio: 'inherit' });

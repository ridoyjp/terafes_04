// Run from C:\terafes_04 using: node normalize_gakuensai.cjs
// Only correct branding in existing top-level site files; keep backups.
const fs = require('node:fs');
const path = require('node:path');
const files = ['index.html', 'style.css', 'config.js'];
const replacements = [
  [/matsuri\s*[- ]?\s*ai/gi, 'Gakuensai AI'],
  [/matsuri/gi, 'gakuensai'],
  [/まつり\s*AI/gi, '学園祭AI'],
  [/祭り\s*AI/gi, '学園祭AI'],
  [/まつり/g, '学園祭'],
  [/祭り/g, '学園祭']
];
for (const name of files) {
  const file = path.join(process.cwd(), name);
  if (!fs.existsSync(file)) { console.log(`SKIP missing: ${name}`); continue; }
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, to] of replacements) after = after.replace(re, to);
  if (name === 'index.html') {
    // Change the browser's cached script URL so the welcome audio update loads.
    after = after.replace(/(src=["']script\.js)(?:\?[^"']*)?(["'])/g, '$1?v=gakuensai-loop-20261021$2');
  }
  if (after === before) { console.log(`OK already: ${name}`); continue; }
  const backup = `${file}.before-gakuensai.bak`;
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  fs.writeFileSync(file, after, 'utf8');
  console.log(`UPDATED: ${name} (backup created if absent)`);
}

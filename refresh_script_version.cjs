const fs = require('node:fs');
const path = require('node:path');
const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) { console.error('index.html not found in current directory'); process.exit(1); }
const before = fs.readFileSync(file, 'utf8');
const regex = /(<script\s+src=["']script\.js)(?:\?[^"']*)?(["']\s*><\/script>)/g;
const occurrences = [...before.matchAll(regex)].length;
if (occurrences !== 1) { console.error(`Expected one script.js reference, found ${occurrences}; no changes made.`); process.exit(1); }
const after = before.replace(regex, '$1?v=gakuensai-phonetic-20261021-2$2');
if (after !== before) {
  fs.copyFileSync(file, `${file}.before-voice-cache-fix.bak`);
  fs.writeFileSync(file, after, 'utf8');
  console.log('Updated script.js version query in index.html');
} else {
  console.log('Cache version already up to date');
}

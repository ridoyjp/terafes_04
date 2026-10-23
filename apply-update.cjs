// Run from the repository root: node apply-update.cjs
// Minimal, idempotent changes. Never touches Cloudflare credentials or festival data.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const scriptFile = path.join(root, 'script.js');
const htmlFile = path.join(root, 'index.html');
const sourceLogo = path.join(__dirname, 'update-files', 'robot-logo.png');
const destLogo = path.join(root, 'assets', 'robot-logo.png');
for (const f of [scriptFile, htmlFile, sourceLogo, destLogo]) assert(fs.existsSync(f), `Missing: ${f}`);
const old = fs.readFileSync(scriptFile,'utf8');
let next = old;
const original = `  pendingChat = true;\n  // For typed input, Gemini follows the actual message language.`;
const improved = `  pendingChat = true;\n  messages.setAttribute("aria-busy", "true");\n  const sendButton = document.querySelector('#form button[type="submit"]');\n  if (sendButton) sendButton.disabled = true;\n  // For typed input, Gemini follows the actual message language.`;
if (next.includes(original)) next=next.replace(original,improved);
else assert(next.includes(improved),'Chat busy guard does not match this version of script.js; aborting.');
const original2 = `    speakAnswer(result.text, lastQuestionLanguage);\n  }\n\n  pendingChat = false;\n}`;
const improved2 = `    try {\n      speakAnswer(result.text, lastQuestionLanguage);\n    } catch (error) {\n      console.warn("Speech output unavailable", error);\n      voiceMessage("🔇 音声を再生できませんでした。文字の回答をご確認ください。");\n    }\n  }\n\n  pendingChat = false;\n  messages.removeAttribute("aria-busy");\n  if (sendButton) sendButton.disabled = false;\n}`;
if(next.includes(original2)) next=next.replace(original2,improved2);
else assert(next.includes(improved2),'Speech guard does not match this version of script.js; aborting.');
// No broad HTML or CSS replacement: existing avatar paths point to robot-logo.png.
assert(fs.readFileSync(htmlFile,'utf8').includes('assets/robot-logo.png'), 'Initial chat avatar path changed; aborting.');
assert(next.includes('const BOT_ICON = "assets/robot-logo.png"'), 'Dynamic avatar path changed; aborting.');
assert(next.includes('<img src="assets/robot-logo.png" alt="Chatbot">'), 'Typing avatar path changed; aborting.');
fs.writeFileSync(scriptFile,next);
fs.copyFileSync(sourceLogo,destLogo);
console.log('PASS: updated reply robot logo and safer chat busy/speech handling.');
console.log('Next: node tools/full-function-check.mjs');

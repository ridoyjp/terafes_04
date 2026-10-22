// Group 04 — offline responsive design regression checks.
// Run: node tools/responsive-design-test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');
const exists = (name) => fs.existsSync(new URL(name, root));
const html = read('index.html');
const css = read('hero-responsive.css');
const js = read('script.js');

for (const file of ['style.css', 'hero-responsive.css', 'script.js', 'config.js',
  'assets/festival-logo.webp', 'assets/hero-robot-round-glow.png', 'assets/robot-logo.png',
  'cloudflare-worker/src/index.js', 'cloudflare-worker/src/school-data.js']) {
  assert(exists(file), `Missing required file: ${file}`);
}
assert.match(html, /name="viewport"[^>]*width=device-width/, 'Viewport meta is required');
assert.match(html, /href="hero-responsive\.css\?v=/, 'Responsive stylesheet not loaded');
assert.match(html, /src="assets\/hero-robot-round-glow\.png"/, 'Blue mascot not used');
for (const id of ['intro', 'introLogo', 'welcomeRobot', 'welcomeVoiceButton',
  'startButton', 'chat', 'backButton', 'messages', 'input', 'form', 'micButton', 'soundButton']) {
  assert(html.includes(`id="${id}"`), `Existing JS hook lost: ${id}`);
}
assert.equal((html.match(/data-intro-question=/g) || []).length, 3, 'Need 3 welcome shortcuts');
assert.match(js, /\[data-intro-question\]/, 'Welcome shortcuts are not wired');
assert.match(js, /openChat\(\);\s*if \(question\) ask\(question\)/, 'Welcome shortcut must open chat');
assert.match(css, /@media \(max-width: 600px\)/, 'Phone layout missing');
assert.match(css, /@media \(max-height: 720px\)/, 'Short-screen support missing');
assert.match(css, /prefers-reduced-motion/, 'Reduced motion support missing');
assert.match(css, /#intro\.intro\[hidden\]/, 'Hidden welcome screen must not be displayed');
assert.match(html, /assets\/festival-logo\.webp/, 'Festival logo missing');
assert.match(html, /チャットを始める/, 'CTA missing');
const image = fs.readFileSync(new URL('assets/hero-robot-round-glow.png', root));
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Hero image must be PNG');
execFileSync(process.execPath, ['--check', fileURLToPath(new URL('script.js', root))]);
console.log('PASS: responsive stylesheet, desktop/phone breakpoints, hero image, all chat/voice hooks, welcome shortcuts, JavaScript syntax');
console.log('NOTE: live device microphone, TTS, and Gemini API still require on-device tests.');

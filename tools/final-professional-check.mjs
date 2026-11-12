// Read-only inspection of the CURRENT TTC Festival UI and safe AI fallback.
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const text=x=>fs.readFileSync(new URL(x,root),'utf8');
const html=text('index.html'),js=text('script.js'),css=text('style.css'),conf=text('config.js');
let count=0;function check(title,cb){cb();count++;console.log('PASS',title);}
for(const file of ['script.js','festival-floor-guide.js','cloudflare-worker/src/index.js','cloudflare-worker/src/floor-guide-data.js'])
 check('Syntax: '+file,()=>execFileSync(process.execPath,['--check',fileURLToPath(new URL(file,root))]));
check('Main landing view and original Robot',()=>{assert.match(html,/id="intro"/);assert.match(html,/id="welcomeRobot"/);assert.match(html,/hero-robot-round-glow\.png/);});
check('Original professional 3 logos intact',()=>assert.equal((html.match(/class="intro-button-icon"/g)||[]).length,3));
check('5-option information menu',()=>assert.equal((html.match(/data-festival-nav=/g)||[]).length,5));
check('Responsive styles',()=>{assert.match(css,/@media/);assert.match(text('hero-responsive.css'),/max-width/);});
check('Microphone and speaker buttons',()=>{assert.match(html,/id="micButton"/);assert.match(html,/id="soundButton"/);assert.match(js,/startJapaneseOnlyVoice/);});
check('Natural voice speeds',()=>{assert.match(js,/const JAPANESE_VOICE_RATE = 1\.08/);assert.match(js,/const WELCOME_VOICE_RATE = 0\.98/);});
check('Offline guide preempts a slow AI request',()=>{assert.match(js,/cancelPendingAiReply\(\)/);assert.match(js,/if \(pendingChat\) \{/);assert.match(js,/localReply/);});
check('Quota cooldown does not disable local menu',()=>{assert.match(js,/aiRetryAfter/);assert.match(js,/offlineAiExplanation/);});
check('No frontend API secret',()=>assert.doesNotMatch(html+js+conf,/AIza[\w-]{30,}/));
check('Worker stores Gemini key as env secret',()=>assert.match(text('cloudflare-worker/src/index.js'),/env\.GEMINI_API_KEY/));
console.log(`CURRENT_PROJECT_QA: ${count}/${count} PASS; no live Gemini or real Safari tested`);

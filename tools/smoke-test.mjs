// No network, no API key needed. Run: node tools/smoke-test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import worker from '../cloudflare-worker/src/index.js';
const root = new URL('../', import.meta.url);
function load(name) { return fs.readFileSync(new URL(name, root), 'utf8'); }
for (const name of ['script.js','cloudflare-worker/src/index.js','cloudflare-worker/src/school-data.js','cloudflare-worker/src/festival-data.js']) {
  execFileSync(process.execPath, ['--check', fileURLToPath(new URL(name, root))]);
}
const html=load('index.html'), js=load('script.js');
for (const label of ['チャットを始める', '← 戻る', 'フード', 'ゲーム', 'ステージ', '会場案内']) assert(html.includes(label), `missing ${label}`);
for (const file of ['script.js','style.css','config.js','assets/festival-logo.webp','assets/robot-logo.png']) assert(fs.existsSync(new URL(file,root)), `missing ${file}`);
assert(js.includes('r.lang = "ja-JP"'), 'Japanese browser STT missing');
assert(js.includes('language: "ja-JP"'), 'Japanese Gemini audio fallback missing');
assert(js.includes('がくえんさい、エーアイ'), 'Welcome reading missing');
let prompt,sttPrompt;
globalThis.fetch=async(_url,opts)=>{
  const req=JSON.parse(opts.body);
  if (req.systemInstruction) prompt=req.systemInstruction.parts[0].text;
  else sttPrompt=req.contents?.[0]?.parts?.[0]?.text;
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'2026年の詳細は学校の公式案内をご確認ください。'}]}}]}),{status:200});
};
const api='https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev';
const env={GEMINI_API_KEY:'FAKE_TEST_KEY'};
const invoke=(endpoint,payload,origin='https://ridoyjp.github.io')=>worker.fetch(new Request(api+endpoint,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload)}),env);
let res=await invoke('/chat',{message:'2026年の学園祭はいつ？',responseLanguage:'ja-JP',history:[]});
assert.equal(res.status,200);
const pending = await res.json();
assert.equal(pending.informationStatus, 'UNVERIFIED_2026');
assert.match(pending.reply,/確認が取れていません/);
assert.equal(prompt, undefined, 'unapproved schedule must not call Gemini');
res=await invoke('/chat',{message:'2025年の学園祭について',responseLanguage:'ja-JP',history:[]});
assert.equal(res.status,200);
assert(prompt.includes('未提供・未承認'));
assert(prompt.includes('2025年の参考実績'));
res=await invoke('/transcribe',{audio:'A'.repeat(200),mimeType:'audio/webm',language:'ja-JP'});
assert.equal(res.status,200);
assert(sttPrompt.includes('Japanese speech'));
res=await invoke('/chat',{message:'test'},'https://untrusted.invalid');
assert.equal(res.status,403);
console.log('PASS: JS syntax, Japanese UI, local assets, mic setup, festival approval guard, STT prompt, CORS');
console.log('NOTE: browser microphone, TTS pronunciation, and real Gemini require live device testing.');

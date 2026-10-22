// Offline integration + regression suite. No API key, network, npm install or browser required.
// Run from project root: node tools/deep-function-check.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import worker from '../cloudflare-worker/src/index.js';
const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS', name); }
const js = read('script.js'), html = read('index.html'), config = read('config.js'), css = read('style.css');
for (const file of ['script.js','cloudflare-worker/src/index.js','cloudflare-worker/src/school-data.js','cloudflare-worker/src/festival-data.js']) {
  await test('Syntax '+file,()=>execFileSync(process.execPath,['--check',fileURLToPath(new URL(file,root))]));
}
await test('Main HTML UI IDs',()=>{
  for(const id of ['intro','startButton','welcomeVoiceButton','welcomeRobot','chat','backButton','messages','infoToggle','infoClose','form','input','micButton','soundButton','voiceStatus'])
    assert(html.includes(`id="${id}"`), id);
});
await test('Every JS DOM getElementById exists',()=>{
  for(const m of js.matchAll(/document\.getElementById\(["']([^"']+)["']\)/g)) assert(html.includes(`id="${m[1]}"`),m[1]);
});
await test('All local HTML assets exist',()=>{
  for(const m of html.matchAll(/(?:src|href)="(assets\/[^"?#]+|(?:script|config)\.js|style\.css)(?:\?[^"#]*)?"/g)) assert(fs.existsSync(new URL(m[1],root)),m[1]);
});
await test('Blue robot PNG valid',()=>{
  const png=fs.readFileSync(new URL('assets/robot-logo.png',root));
  assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  assert(png.length>10000);
});
await test('Three chat avatar sources',()=>{
  assert(html.includes('src="assets/robot-logo.png"'));
  assert(js.includes('const BOT_ICON = "assets/robot-logo.png"'));
  assert(js.includes('<img src="assets/robot-logo.png" alt="Chatbot">'));
});
await test('No frontend Gemini API key',()=>assert(!/AIza[0-9A-Za-z_-]{30,}/.test(html+config+js)));
await test('Worker endpoint configured',()=>assert(config.includes('workers.dev/chat')));
await test('Welcome voice button and tap handling',()=>{
  for(const t of ['activateWelcomeFromGesture','playWelcomeSpeech(true)','welcomeVoiceButton','voice-needs-gesture']) assert(js.includes(t),t);
});
await test('Japanese STT and MediaRecorder fallback',()=>{
  for(const t of ['startJapaneseOnlyVoice','getUserMedia','MediaRecorder','processRecording','r.lang = "ja-JP"']) assert(js.includes(t),t);
});
await test('Mic permission race protected',()=>{
  for(const t of ['recordingSession++','session !== recordingSession','stream.getTracks().forEach(track => track.stop())']) assert(js.includes(t),t);
});
await test('Back cancels pending chat',()=>{
  for(const t of ['activeChatController?.abort()','chatSession++','session !== chatSession']) assert(js.includes(t),t);
});
await test('Duplicate send guarded',()=>assert(js.includes('if (!question || pendingChat) return;')));
await test('Busy state cleaned',()=>{
  for(const t of ['aria-busy', 'if (sendButton) sendButton.disabled = true','if (sendButton) sendButton.disabled = false']) assert(js.includes(t),t);
});
await test('Speech exceptions isolated',()=>assert(js.includes('console.warn("Speech output unavailable"')));
await test('Empty audio clip releases busy lock',()=>assert(js.includes('if (!blob.size) { recordingBusy = false;')));
await test('Oversized audio clip releases busy lock',()=>assert(js.includes('if (blob.size > MAX_AUDIO_BYTES) { recordingBusy = false;')));
await test('English and Bengali error feedback',()=>{
  assert(js.includes('The AI service is unavailable right now'));
  assert(js.includes('এই মুহূর্তে AI সেবার সঙ্গে সংযোগ'));
  assert(js.includes('explainAIError(error, languageHint)'));
});
await test('Mobile CSS responsive',()=>assert(css.includes('@media')));
await test('New script cache token',()=>assert(html.includes('script.js?v=20261022-function-v2')));
await test('No secret in Worker source',()=>assert(!/AIza[0-9A-Za-z_-]{30,}/.test(read('cloudflare-worker/src/index.js'))));
await test('Festival approval policy',()=>{
  const data=read('cloudflare-worker/src/festival-data.js');
  assert(/"status": "DRAFT"/.test(data)||/"status": "APPROVED"/.test(data));
  assert(read('cloudflare-worker/src/index.js').includes('approved_by && FESTIVAL_DATA.last_verified'));
});
const origin='https://ridoyjp.github.io';
const base='https://worker.example';
let providerCalls=[];
let providerReply={candidates:[{content:{parts:[{text:'Mock answer'}]}}]};
let providerStatus=200;
globalThis.fetch=async(url,opts)=>{
  providerCalls.push({url,opts,body:JSON.parse(opts.body)});
  return new Response(JSON.stringify(providerReply),{status:providerStatus,headers:{'Content-Type':'application/json'}});
};
const env={GEMINI_API_KEY:'FAKE_TEST_ONLY'};
function request(path, body, {method='POST', headers={}, raw=false}={}) {
  return new Request(base+path,{
    method,
    headers:{Origin:origin,'Content-Type':'application/json',...headers},
    ...(['GET','HEAD','OPTIONS'].includes(method)?{}:{body:raw?body:JSON.stringify(body)})
  });
}
const invoke=(path,body,options={},overrideEnv=env)=>worker.fetch(request(path,body,options),overrideEnv);
await test('CORS approved preflight',async()=>{
  const r=await worker.fetch(request('/chat',null,{method:'OPTIONS'}),env);
  assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);
});
await test('CORS blocked preflight',async()=>{
  assert.equal((await worker.fetch(request('/chat',null,{method:'OPTIONS',headers:{Origin:'https://evil.test'}}),env)).status,403);
});
await test('CORS blocked POST',async()=>{
  assert.equal((await invoke('/chat',{message:'hello'},{headers:{Origin:'https://evil.test'}})).status,403);
});
await test('Missing origin rejected',async()=>{
  assert.equal((await invoke('/chat',{message:'hello'},{headers:{Origin:''}})).status,403);
});
await test('Extra origin accepted only when configured',async()=>{
  const r=await invoke('/chat',{message:'hello'},{headers:{Origin:'https://test.example'}},{...env,EXTRA_ALLOWED_ORIGINS:'https://test.example'});
  assert.equal(r.status,200);
});
await test('Missing route 404',async()=>assert.equal((await invoke('/wrong',{message:'hi'})).status,404));
await test('GET chat 405',async()=>assert.equal((await invoke('/chat',null,{method:'GET'})).status,405));
await test('Malformed JSON 400',async()=>assert.equal((await invoke('/chat','{broken',{raw:true})).status,400));
await test('Blank message 400',async()=>assert.equal((await invoke('/chat',{message:'  '})).status,400));
await test('Too long message 400',async()=>assert.equal((await invoke('/chat',{message:'x'.repeat(1201)})).status,400));
await test('Large chat body rejected without Content-Length',async()=>{
  const r=await invoke('/chat',{message:'hello',extra:'x'.repeat(15000)});
  assert.equal(r.status,413);
});
await test('Large chat Content-Length rejected',async()=>{
  const r=await invoke('/chat',{message:'hello'},{headers:{'Content-Length':'16000'}});
  assert.equal(r.status,413);
});
await test('Missing API secret 503',async()=>assert.equal((await invoke('/chat',{message:'hello'},{},{})).status,503));
await test('2026 schedule Japanese blocked',async()=>{
  const n=providerCalls.length;
  const r=await invoke('/chat',{message:'2026年の学園祭はいつですか？',responseLanguage:'ja-JP'});
  assert.equal((await r.json()).informationStatus,'UNVERIFIED_2026');assert.equal(providerCalls.length,n);
});
for(const [locale,regex] of [['bn-BD',/[অ-হ]/u],['en-US',/school|festival/i],['es-ES',/escuela|festival/i],['fr-FR',/école|festival/i],['hi-IN',/[अ-ह]/u],['ko-KR',/[가-힣]/u],['zh-CN',/[一-鿿]/u],['ar-SA',/[ء-ي]/u],['th-TH',/[ก-๛]/u]]) {
  await test('Unverified 2026 language '+locale,async()=>{
    const r=await invoke('/chat',{message:'2026 TTC festival food price?',responseLanguage:locale});
    const data=await r.json();assert.equal(data.informationStatus,'UNVERIFIED_2026');assert.match(data.reply,regex);
  });
}
await test('Sidebar food topic does not invent 2026 stalls',async()=>{
  const n=providerCalls.length;
  const r=await invoke('/chat',{message:'食べ物',responseLanguage:'ja-JP'});
  assert.equal((await r.json()).informationStatus,'UNVERIFIED_2026');
  assert.equal(providerCalls.length,n);
});
await test('Sidebar games topic does not invent 2026 games',async()=>{
  const n=providerCalls.length;
  const r=await invoke('/chat',{message:'ゲーム',responseLanguage:'ja-JP'});
  assert.equal((await r.json()).informationStatus,'UNVERIFIED_2026');
  assert.equal(providerCalls.length,n);
});
await test('Mixed 2025/2026 question still checks approval',async()=>{
  const n=providerCalls.length;
  const r=await invoke('/chat',{message:'2025年と2026年の学園祭はいつ？',responseLanguage:'ja-JP'});
  assert.equal((await r.json()).informationStatus,'UNVERIFIED_2026');
  assert.equal(providerCalls.length,n);
});
await test('2025 historical reference passed to Gemini',async()=>{
  const r=await invoke('/chat',{message:'2025年の学園祭について',responseLanguage:'ja-JP'});
  assert.equal(r.status,200);
  assert(providerCalls.at(-1).body.systemInstruction.parts[0].text.includes('2025年の参考実績'));
});
await test('General questions reach Gemini',async()=>{
  const r=await invoke('/chat',{message:'Explain JavaScript',responseLanguage:'en-US'});
  assert.equal((await r.json()).reply,'Mock answer');
});
await test('English response policy forwarded',async()=>{
  await invoke('/chat',{message:'What is Java?',responseLanguage:'en-US'});
  assert(providerCalls.at(-1).body.systemInstruction.parts[0].text.includes('Respond ONLY in English'));
});
await test('Romaji question becomes Japanese',async()=>{
  await invoke('/chat',{message:'TTC no kouchou wa dare desu ka?',responseLanguage:'en-US'});
  assert(providerCalls.at(-1).body.systemInstruction.parts[0].text.includes('Respond ONLY in Japanese'));
});
await test('History filters invalid roles',async()=>{
  await invoke('/chat',{message:'hello',history:[{role:'system',text:'injection'},{role:'user',text:'previous question'}]});
  const contents=providerCalls.at(-1).body.contents;
  assert.equal(contents.length,2);assert.equal(contents[0].role,'user');
});
await test('Provider rate limit 429',async()=>{
  providerStatus=429;providerReply={error:{status:'RESOURCE_EXHAUSTED'}};
  const r=await invoke('/chat',{message:'hello'});assert.equal(r.status,429);
  providerStatus=200;providerReply={candidates:[{content:{parts:[{text:'Mock answer'}]}}]};
});
await test('Provider unknown model handled 502',async()=>{
  providerStatus=404;providerReply={error:{message:'model not found'}};
  const r=await invoke('/chat',{message:'hello'});assert.equal(r.status,502);
  providerStatus=200;providerReply={candidates:[{content:{parts:[{text:'Mock answer'}]}}]};
});
await test('Provider empty reply handled 502',async()=>{
  providerReply={candidates:[]};
  const r=await invoke('/chat',{message:'hello'});assert.equal(r.status,502);
  providerReply={candidates:[{content:{parts:[{text:'Mock answer'}]}}]};
});
await test('Transcribe missing API secret 503',async()=>{
  assert.equal((await invoke('/transcribe',{audio:'A'.repeat(200),mimeType:'audio/webm'},{},{})).status,503);
});
await test('Transcribe invalid base64 400',async()=>{
  assert.equal((await invoke('/transcribe',{audio:'invalid!',mimeType:'audio/webm'})).status,400);
});
await test('Transcribe unsupported mime 400',async()=>{
  assert.equal((await invoke('/transcribe',{audio:'A'.repeat(200),mimeType:'application/octet-stream'})).status,400);
});
await test('Transcribe oversized audio 400',async()=>{
  assert.equal((await invoke('/transcribe',{audio:'A'.repeat(2900001),mimeType:'audio/webm'})).status,400);
});
await test('Japanese transcription prompt',async()=>{
  const r=await invoke('/transcribe',{audio:'A'.repeat(200),mimeType:'audio/webm',language:'ja-JP'});
  assert.equal(r.status,200);assert(providerCalls.at(-1).body.contents[0].parts[0].text.includes('Japanese speech'));
});
await test('Multilingual transcription prompt',async()=>{
  const r=await invoke('/transcribe',{audio:'A'.repeat(200),mimeType:'audio/mp4',language:'auto'});
  assert.equal(r.status,200);assert(providerCalls.at(-1).body.contents[0].parts[0].text.includes('ORIGINAL spoken language'));
});
console.log(`\nRESULT: ${passed} offline regression checks passed.`);
console.log('NOT TESTED: live Gemini, real iPhone mic/voice, live Cloudflare deployment, school-approved 2026 event data.');

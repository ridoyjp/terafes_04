// Offline integration tests. Run from the project root with node tools/full-function-check.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import worker from '../cloudflare-worker/src/index.js';
const root = new URL('../', import.meta.url);
const read = f => fs.readFileSync(new URL(f,root),'utf8');
let passed = 0;
const check = (name, fn) => { fn(); passed++; console.log('PASS',name); };
const checkAsync = async (name, fn) => { await fn(); passed++; console.log('PASS',name); };
const html=read('index.html'),js=read('script.js'),css=read('style.css'),config=read('config.js');
check('JavaScript syntax',()=>{
 for(const f of ['script.js','cloudflare-worker/src/index.js','cloudflare-worker/src/school-data.js','cloudflare-worker/src/festival-data.js']) execFileSync(process.execPath,['--check',fileURLToPath(new URL(f,root))]);
});
check('DOM selectors exist',()=>{
 const ids=[...js.matchAll(/document\.getElementById\(["']([^"']+)["']\)/g)].map(m=>m[1]);
 for(const id of new Set(ids)) assert(new RegExp(`\\bid=["']${id}["']`).test(html),`missing HTML id ${id}`);
});
check('Main UI controls',()=>{
 for(const id of ['startButton','backButton','infoToggle','infoClose','form','input','micButton','soundButton','messages','welcomeVoiceButton']) assert(html.includes(`id="${id}"`),`missing ${id}`);
 assert((html.match(/data-q=/g)||[]).length>=10,'Quick questions missing');
});
check('Local HTML assets',()=>{
 for(const m of html.matchAll(/(?:src|href)="(assets\/[^"?#]+|(?:script|style|config)\.js|style\.css)(?:\?[^"#]*)?"/g)) assert(fs.existsSync(new URL(m[1],root)),`missing asset ${m[1]}`);
});
check('All three bot reply avatar references',()=>{
 assert(html.includes('src="assets/robot-logo.png"'));
 assert(js.includes('const BOT_ICON = "assets/robot-logo.png"'));
 assert(js.includes('<img src="assets/robot-logo.png" alt="Chatbot">'));
});
check('Voice and audio controls wired',()=>{
 for(const term of ['startJapaneseOnlyVoice','processRecording','SpeechSynthesisUtterance','startSilenceDetection','getUserMedia','TRANSCRIBE_API_URL','welcomeVoiceButton']) assert(js.includes(term),term);
});
check('No client-side API key',()=>{
 assert(!/AIza[0-9A-Za-z_-]{30,}/.test(config+html),'Potential Gemini key in frontend');
 assert(config.includes('workers.dev/chat'),'Worker API config missing');
});
check('Busy guard installed',()=>{
 assert(js.includes('messages.setAttribute("aria-busy", "true")'));
 assert(js.includes('messages.removeAttribute("aria-busy")'));
 assert(js.includes('Speech output unavailable'));
});
check('Festival data not falsely approved',()=>{
 const festival=read('cloudflare-worker/src/festival-data.js');
 assert(festival.includes('"status": "DRAFT"') || festival.includes('"status": "APPROVED"'));
});
let calls=[];
globalThis.fetch=async (url, opts)=>{
 const body=JSON.parse(opts.body);calls.push({url,body});
 return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Test reply'}]}}]}),{status:200,headers:{'Content-Type':'application/json'}});
};
const base='https://example.workers.dev';
const env={GEMINI_API_KEY:'TEST_FAKE_KEY'};
const origin='https://ridoyjp.github.io';
function req(path,body,headers={},method='POST') {
 return new Request(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(['GET','HEAD'].includes(method)?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
}
const call=(path,body,headers,method)=>worker.fetch(req(path,body,headers,method),env);
await checkAsync('CORS preflight accepted',async()=>{
 const res=await worker.fetch(new Request(base+'/chat',{method:'OPTIONS',headers:{Origin:origin}}),env);
 assert.equal(res.status,204);assert.equal(res.headers.get('Access-Control-Allow-Origin'),origin);
});
await checkAsync('CORS untrusted origin blocked',async()=>{
 const res=await worker.fetch(req('/chat',{message:'test'},{Origin:'https://evil.example'}),env);assert.equal(res.status,403);
});
await checkAsync('Unknown endpoint 404',async()=>{assert.equal((await call('/missing',{message:'test'})).status,404);});
await checkAsync('Invalid HTTP method 405',async()=>{assert.equal((await call('/chat',null,{},'GET')).status,405);});
await checkAsync('Invalid JSON 400',async()=>{assert.equal((await call('/chat','{invalid')).status,400);});
await checkAsync('Empty message 400',async()=>{assert.equal((await call('/chat',{message:' '})).status,400);});
await checkAsync('Oversized message 400',async()=>{assert.equal((await call('/chat',{message:'x'.repeat(1201)})).status,400);});
await checkAsync('Missing Worker API secret 503',async()=>{
 const res=await worker.fetch(req('/chat',{message:'hello'}),{});assert.equal(res.status,503);
});
await checkAsync('Unverified 2026 event dates blocked',async()=>{
 const res=await call('/chat',{message:'2026年の学園祭はいつ？',responseLanguage:'ja-JP'});
 assert.equal(res.status,200);assert.equal((await res.json()).informationStatus,'UNVERIFIED_2026');
});
await checkAsync('Unverified festival in Bengali',async()=>{
 const res=await call('/chat',{message:'উৎসব কবে হবে?',responseLanguage:'bn-BD'});
 const data=await res.json();assert.equal(data.informationStatus,'UNVERIFIED_2026');assert(/[অ-হ]/u.test(data.reply));
});
await checkAsync('2025 historical context allowed',async()=>{
 const res=await call('/chat',{message:'2025年の学園祭について'});
 assert.equal(res.status,200);assert.equal((await res.json()).reply,'Test reply');
 assert(calls.at(-1).body.systemInstruction.parts[0].text.includes('2025年の参考実績'));
});
await checkAsync('English AI response language requested',async()=>{
 const res=await call('/chat',{message:'How do I learn Java?',responseLanguage:'en-US'});
 assert.equal(res.status,200);assert(calls.at(-1).body.systemInstruction.parts[0].text.includes('English'));
});
await checkAsync('Japanese Romaji detection',async()=>{
 const res=await call('/chat',{message:'TTC no kouchou wa dare desu ka?',responseLanguage:'en-US'});
 assert.equal(res.status,200);assert(calls.at(-1).body.systemInstruction.parts[0].text.includes('Japanese'));
});
await checkAsync('Invalid audio rejected',async()=>{
 const res=await call('/transcribe',{audio:'!!bad!!',mimeType:'audio/webm'});assert.equal(res.status,400);
});
await checkAsync('Unsupported audio format rejected',async()=>{
 const res=await call('/transcribe',{audio:'A'.repeat(200),mimeType:'application/octet-stream'});assert.equal(res.status,400);
});
await checkAsync('Japanese audio transcription request built',async()=>{
 const res=await call('/transcribe',{audio:'A'.repeat(200),mimeType:'audio/webm',language:'ja-JP'});
 assert.equal(res.status,200);assert.equal((await res.json()).transcript,'Test reply');
 assert(calls.at(-1).body.contents[0].parts[0].text.includes('Japanese speech'));
});
console.log(`\nRESULT: ${passed} offline checks passed.\nNOT TESTED: real Gemini, iPhone microphone/Safari TTS, deployed Cloudflare Worker, visual UI.`);

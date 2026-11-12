import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import worker from '../cloudflare-worker/src/index.js';
import { answerFloorGuide as workerFloor } from '../cloudflare-worker/src/floor-guide-data.js';
import { getOfficialSchoolFacts } from '../cloudflare-worker/src/official-school-facts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browserScope = { window: {} };
vm.runInNewContext(readFileSync(path.join(root,'festival-floor-guide.js'),'utf8'),browserScope);
const browserFloor = browserScope.window.answerTtcFloorGuide;
let passed = 0;
function check(testName, fn) { fn(); passed++; console.log(`PASS ${testName}`); }

const general = [
  '東京のおいしい食べ物は何ですか',
  '東京都内のラーメンはおすすめですか',
  'What foods should I try in Tokyo?',
  '東京のゲーム産業を教えて',
  'ゲームの作り方を教えて',
  'ゲームは何ですか',
  'Javaのプログラミングについて教えて',
  '情報処理科では何を学びますか',
  'IoT+AI科について教えて',
  '東京テクニカルカレッジの先生は誰ですか',
  '学校の学費はいくらですか',
  'What is 5 times 9?',
  'パーソナルカラー診断とは何ですか',
  '今日の食べ物のレシピを教えて',
  'How do databases work?',
  '東京の夏祭りを教えて',
  'What is Diwali festival?',
  'What festivals are popular in India?'
];
for(const q of general) {
  check(`unrelated/school not hijacked: ${q}`, () => {
    assert.equal(workerFloor(q,'ja-JP'),null);
    assert.equal(browserFloor(q,'ja-JP'),null);
  });
}
const festival = [
  ['11F 1103号室には何がありますか', '1103'],
  ['生成AIによる目押しゲームはどこですか', '501'],
  ['学園祭の食べ物はどこですか', '1F'],
  ['3Dプリンター体験はどこですか', '1101'],
  ['ミニゆるメカトロはどこですか', '6F'],
  ['4F 405号室には何がありますか', '405']
];
for (const [q,required] of festival) {
  check(`on-campus event: ${q}`,()=>{
    for(const reply of [workerFloor(q,'ja-JP'),browserFloor(q,'ja-JP')]) {
      assert.ok(reply && reply.includes(required),JSON.stringify(reply));
    }
  });
}
for(const [q,needle] of [
  ['学費は無料ですか', '全員一律無料ではない'],
  ['情報処理科のカリキュラム', 'Java'],
  ['就職サポート', 'インターンシップ'],
  ['東京テクニカルカレッジの歴史', '1987'],
  ['校長先生は誰ですか', '白井'],
  ['奨学金はありますか','減免']]) {
  check(`verified school fact: ${q}`,()=>assert.ok(getOfficialSchoolFacts(q).includes(needle),getOfficialSchoolFacts(q)));
}
// Mock the upstream Gemini API: this checks routing and ground truth placement,
// NOT the model's real-world correctness or live credentials.
let lastPrompt = '';
let upstreamCalls = 0;
globalThis.caches = { default: { match: async()=>null,put:async()=>{} } };
const mockResponse = question => new Response(JSON.stringify({candidates:[{content:{parts:[{text:`MOCK Gemini answer: ${question}`}]}}]}),{status:200,headers:{'content-type':'application/json'}});
globalThis.fetch = async (_url,opts) => {
  upstreamCalls++;
  const body = JSON.parse(opts.body);
  lastPrompt = body.systemInstruction.parts[0].text;
  return mockResponse(body.contents.at(-1).parts[0].text);
};
const env = {
  GEMINI_API_KEY: 'DUMMY_NOT_LIVE',
  FESTIVAL_QUOTA: {idFromName:()=> 'test',get:()=>({fetch:async (_url,options)=> {
    const body=JSON.parse(options.body);
    if(body.action==='cache_get') return Response.json({hit:false});
    return Response.json({allowed:true});
  }})}
};
async function chat(q,history=[]) {
  const request = new Request('https://worker.example/chat', {method:'POST',headers:{Origin:'https://ridoyjp.github.io','content-type':'application/json'},body:JSON.stringify({message:q,history,responseLanguage:'ja-JP'})});
  const response = await worker.fetch(request,env,{waitUntil:()=>{}});
  return {status: response.status, payload:await response.json()};
}
for(const q of ['東京のおいしい食べ物は何ですか','情報処理科では何を学びますか','学校の学費は無料ですか','ゲームの作り方を教えて']){
  const result=await chat(q);
  check(`worker model route ${q}`,()=>{
    assert.equal(result.status,200);
    assert.ok(result.payload.reply.startsWith('MOCK Gemini answer'));
    assert.ok(!lastPrompt.includes('【2026年 フロアガイド掲載情報（学校提供Excelから転記）】'));
  });
  if(q.includes('学費'))check('tuition grounding to official page',()=>assert.ok(lastPrompt.includes('https://tec.ttc.ac.jp/entrance/expenses/')));
  if(q.includes('情報処理科'))check('subject grounding to official curriculum',()=>assert.ok(lastPrompt.includes('Java')));
}
const before = upstreamCalls;
const local = await chat('11F 1103号室には何がありますか');
check('worker festival local reply bypasses Gemini',()=>{
  assert.equal(local.status,200);
  assert.equal(upstreamCalls,before);
  assert.ok(local.payload.reply.includes('1103'));
});
console.log(`\n${passed}/${passed} routing and source checks PASS (upstream Gemini mocked)`);

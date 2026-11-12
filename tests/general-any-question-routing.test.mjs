import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import worker from '../cloudflare-worker/src/index.js';
import { answerFloorGuide as serverFloor } from '../cloudflare-worker/src/floor-guide-data.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'festival-floor-guide.js'),'utf8'),scope);
const browserFloor=scope.window.answerTtcFloorGuide;
let passed=0;
const general=[
 '東京のおいしい食べ物は何ですか',
 'বাংলাদেশের রাজধানী কী?',
 'Explain the water cycle',
 'What is 25 * 9?',
 'JavaScriptで配列を並べ替える方法',
 'What is a school festival?',
 'What are the best festivals in India?',
 '日本の学校制度について教えて',
 'What does a college teacher do?',
 'What is the tuition at Harvard University?',
 '世界の祭りについて教えて',
 'How to build a game in Python?',
 'What does HTTP 501 error mean?',
 '韓国料理をおすすめしてください',
 'パーソナルカラー診断とは何ですか',
 'Please translate this English text to Japanese'
];
const festival=[
 '5F 501号室には何がありますか',
 '学園祭の食べ物はどこですか',
 'バルーンアートはどこですか',
 '11F 1103号室を教えて',
 'TTC festivalのゲームはどこですか'
];
for(const q of general){
 assert.equal(browserFloor(q,'ja-JP'),null,'browser should pass to Gemini: '+q);
 assert.equal(serverFloor(q,'ja-JP'),null,'server should pass to Gemini: '+q);
 passed++;
}
for(const q of festival){
 assert.ok(browserFloor(q,'ja-JP'),'browser should answer festival: '+q);
 assert.ok(serverFloor(q,'ja-JP'),'server should answer festival: '+q);
 passed++;
}
let requestCount=0;
let lastPayload;
globalThis.caches={default:{match:async()=>null,put:async()=>{}}};
globalThis.fetch=async(_url,opts)=>{
 requestCount++;
 lastPayload=JSON.parse(opts.body);
 return Response.json({candidates:[{content:{parts:[{text:'MOCK general answer'}]}}]});
};
const env={GEMINI_API_KEY:'MOCK_KEY_NOT_REAL',FESTIVAL_QUOTA:{idFromName:()=> 'test',get:()=>({fetch:async (_url,options)=>{
  const data=JSON.parse(options.body);
  if(data.action==='cache_get')return Response.json({hit:false});
  return Response.json({allowed:true});
 }})}};
async function chat(q){
 const request=new Request('https://worker.test/chat',{method:'POST',headers:{Origin:'https://ridoyjp.github.io','Content-Type':'application/json'},body:JSON.stringify({message:q})});
 const response=await worker.fetch(request,env,{waitUntil:()=>{}});
 assert.equal(response.status,200,'HTTP 200 for '+q);
 return response.json();
}
for (const q of general){
 const before=requestCount;
 const result=await chat(q);
 assert.equal(requestCount,before+1,'Gemini called for '+q);
 assert.equal(result.reply,'MOCK general answer');
 assert.ok(!lastPayload.systemInstruction.parts[0].text.includes('【2026年 フロアガイド掲載情報（学校提供Excelから転記）】'), 'No festival source for '+q);
 assert.ok(!lastPayload.systemInstruction.parts[0].text.includes('【東京テクニカルカレッジ公式公開情報'), 'No TTC knowledge injection for '+q);
 passed++;
}
for (const q of festival){
 const before=requestCount;
 const result=await chat(q);
 assert.equal(requestCount,before,'Local festival answer without Gemini: '+q);
 assert.ok(result.reply && result.reply!=='MOCK general answer');
 passed++;
}
for (const [q,topic] of [
 ['TTCの情報処理科では何を学びますか','【東京テクニカルカレッジ公式公開情報'],
 ['学校の学費はいくらですか','【東京テクニカルカレッジ公式公開情報'],
]){
 await chat(q);
 assert.ok(lastPayload.systemInstruction.parts[0].text.includes(topic),'Relevant TTC info: '+q);
 passed++;
}
console.log(`GENERAL_AI_ROUTING: ${passed}/${passed} PASS — Gemini mocked, not live`);

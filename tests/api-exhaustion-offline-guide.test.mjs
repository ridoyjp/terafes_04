import assert from 'node:assert/strict';
import worker from '../cloudflare-worker/src/index.js';
import { answerFloorGuide, FLOOR_GUIDE } from '../cloudflare-worker/src/floor-guide-data.js';
const origin='https://ridoyjp.github.io';
const known=['501号室には何がありますか','入学相談コーナーはどこですか','1103号室の企画を教えて','学園祭のゲームはどこですか','5Fの情報を教えて','1Fのコーヒーコーナーはどこですか'];
const generic=['東京のおいしい食べ物は何ですか','JavaScriptとは何ですか'];
const ctx={waitUntil:()=>{}};
const oldFetch=globalThis.fetch;
const oldCaches=globalThis.caches;
let callCount=0;
globalThis.caches={default:{match:async()=>null,put:async()=>{}}};
const fakeQuota={idFromName:()=> 'qa',get:()=>({fetch:async(_url,opt)=>{
 const body=JSON.parse(opt.body);
 if(body.action==='cache_get')return Response.json({hit:false});
 return Response.json({allowed:true});
}})};
const req=q=>new Request('https://worker.qa/chat',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({message:q})});
async function run(q,env){const response=await worker.fetch(req(q),env,ctx);return {status:response.status,body:await response.json()};}
let passed=0;
try{
 for(const q of known){
  assert.ok(answerFloorGuide(q,'ja-JP'),`must have a grounded static answer: ${q}`);
  passed++;
 }
 // API key missing: verified school floor guide still returns HTTP 200.
 for(const q of known){
  const r=await run(q,{FESTIVAL_QUOTA:fakeQuota});
  assert.equal(r.status,200,`no-key offline guide ${q}`);
  assert.match(r.body.reply,/FESTIVAL|フロア|コーナー|情報|ガイド/);
  passed++;
 }
 const noKey=await run('What is JavaScript?',{FESTIVAL_QUOTA:fakeQuota});
 assert.equal(noKey.status,503); passed++;
 // Gemini returned exhausted quota: general question is 429, but floor guide bypasses it.
 globalThis.fetch=async()=>{callCount++;return Response.json({error:{status:'RESOURCE_EXHAUSTED'}},{status:429});};
 const env={GEMINI_API_KEY:'UNIT_TEST_ONLY',FESTIVAL_QUOTA:fakeQuota};
 for(const q of generic){const r=await run(q,env);assert.equal(r.status,429);passed++;}
 const before=callCount;
 for(const q of known){const r=await run(q,env);assert.equal(r.status,200);assert.ok(r.body.reply);passed++;}
 assert.equal(callCount,before,'NO Gemini calls for locally grounded event questions');passed++;
 // English unrelated requests never receive festival data.
 assert.equal(answerFloorGuide('Tokyo restaurants and food','en-US'),null);passed++;
 // Rooms missing in XLSX are not fabricated.
 const admission=answerFloorGuide('入学相談コーナーはどこですか','ja-JP');
 assert.match(admission,/1F/); assert.doesNotMatch(admission,/部屋番号未記載|1F\/\d/);passed++;
 assert.equal(FLOOR_GUIDE.entries.length,21);passed++;
 console.log(`OFFLINE_WORKER_QA: ${passed}/${passed} PASS; 429 quota simulated, no live Gemini`);
}finally {globalThis.fetch=oldFetch; globalThis.caches=oldCaches;}

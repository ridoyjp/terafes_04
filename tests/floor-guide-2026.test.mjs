import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import worker from '../cloudflare-worker/src/index.js';
import {FLOOR_GUIDE,answerFloorGuide as serverAnswer} from '../cloudflare-worker/src/floor-guide-data.js';
import {html,js,data} from './helpers/current-menu.mjs';
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../festival-floor-guide.js',import.meta.url),'utf8'),ctx);
const browserAnswer=ctx.window.answerTtcFloorGuide;
test('Both source copies contain nine floors and 21 original rows',()=>{
 assert.equal(data.entries.length,21);assert.equal(data.floors.length,9);
 assert.equal(FLOOR_GUIDE.entries.length,21);assert.equal(ctx.window.TTC_FLOOR_GUIDE.entries.length,21);
});
test('Known rooms and 1F cafe work without Gemini',()=>{
 for(const q of ['501号室には何がありますか','1103号室はどこですか','入学相談コーナーはどこですか']){
  assert.ok(browserAnswer(q));assert.ok(serverAnswer(q));}
});
test('Generic questions cannot be hijacked by festival guide',()=>{
 assert.equal(browserAnswer('東京のおいしい食べ物は何ですか'),null);
 assert.equal(serverAnswer('What does HTTP 501 error mean?'),null);
});
test('Unknown general festival stage location is not fabricated',()=>{
 const answer=serverAnswer('学園祭のステージについて教えて');
 assert.ok(answer);assert.match(answer,/記載がありません/);
});
test('Current local assets and menu are referenced',()=>{
 assert.match(html,/festival-floor-guide\.js\?v=/);
 assert.match(html,/id="festivalMainOptions"/);
 assert.match(js,/window\.answerTtcFloorGuide/);
});
test('Worker local floor route remains available without API key',async()=>{
 const r=new Request('https://worker.qa/chat',{method:'POST',headers:{Origin:'https://ridoyjp.github.io','Content-Type':'application/json'},body:JSON.stringify({message:'501号室には何がありますか'})});
 const res=await worker.fetch(r,{});assert.equal(res.status,200);assert.match((await res.json()).reply,/情報処理科/);
});

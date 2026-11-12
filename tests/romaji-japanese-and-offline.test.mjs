import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import worker from '../cloudflare-worker/src/index.js';

const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=fs.readFileSync(path.join(dir,'script.js'),'utf8');
const section=script.slice(script.indexOf('function isJapaneseRomaji('), script.indexOf('function detectWrittenLanguage('));
const context=vm.createContext({});
vm.runInContext(section,context);
const {isJapaneseRomaji, incompleteRomajiQuestion,prepareTypedQuestion}=context;
let checks=0;
for(const [q,expected] of [
 ['nihon ki',true], ['nihon wa donna kuni desu ka',true],['nihon no rekishi wo oshiete',true],
 ['nihongo ga wakaranai',true],['gakkou wa doko desu ka',true],['TTC no gakka wa',true],
 ['What is nihon?',false],['What are Tokyo foods?',false],['JavaScript is fast',false],['こんにちは',false],['বাংলাদেশ',false]
]){assert.equal(isJapaneseRomaji(q),expected,`frontend recognition: ${q}`);checks++;}
assert.equal(prepareTypedQuestion('nihon ki'),'nihon ki');checks++;
assert.equal(prepareTypedQuestion('nihon no rekishi wo oshiete'),'日本の歴史を教えて');checks++;
assert.match(incompleteRomajiQuestion('nihon ki'),/質問が途中/);checks++;
assert.equal(incompleteRomajiQuestion('nihon no rekishi wo oshiete'),'');checks++;

const origin='https://ridoyjp.github.io';
const req=(message,responseLanguage='en-US')=>new Request('https://test.workers.dev/chat',{
 method:'POST',headers:{origin,'content-type':'application/json'},
 body:JSON.stringify({message,responseLanguage})
});
let remoteCalls=0, lastPayload;
const realFetch=globalThis.fetch, realCaches=globalThis.caches;
globalThis.caches={default:{match:async()=>null,put:async()=>{}}};
const env={GEMINI_API_KEY:'FAKE_TEST_KEY',FESTIVAL_QUOTA:{idFromName:()=> 'a',get:()=>({fetch:async(_url,options)=> {
  const input=JSON.parse(options.body);
  if(input.action==='cache_get') return Response.json({hit:false});
  return Response.json({allowed:true});
 }})}};
globalThis.fetch=async (_url,opts)=>{
 remoteCalls++;
 lastPayload=JSON.parse(opts.body);
 return Response.json({candidates:[{content:{parts:[{text:'MOCK upstream answer'}]}}]});
};
try{
 const short=await worker.fetch(req('nihon ki'),{},{waitUntil:()=>{}});
 assert.equal(short.status,200); checks++;
 const shortBody=await short.json();
 assert.match(shortBody.reply,/質問が途中/);checks++;
 assert.equal(remoteCalls,0);checks++;
 for(const q of ['nihon no rekishi wo oshiete','nihongo ga wakaranai']){
  const res=await worker.fetch(req(q),env,{waitUntil:()=>{}});
  assert.equal(res.status,200);checks++;
  const body=await res.json();assert.equal(body.reply,'MOCK upstream answer');checks++;
  assert.match(lastPayload.systemInstruction.parts[0].text,/Respond ONLY in Japanese/);checks++;
 }
 const res=await worker.fetch(req('What is the weather in Tokyo?'),env,{waitUntil:()=>{}});
 assert.equal(res.status,200);checks++;
 assert.match(lastPayload.systemInstruction.parts[0].text,/Respond ONLY in English/);checks++;
 const noKey=await worker.fetch(req('nihon no rekishi wo oshiete'),{},{waitUntil:()=>{}});
 assert.equal(noKey.status,503);checks++;
}finally {globalThis.fetch=realFetch;globalThis.caches=realCaches;}
console.log(`ROMAJI_ROUTING_AND_API_QA: ${checks}/${checks} PASS (Gemini mocked)`);

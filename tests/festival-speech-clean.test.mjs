import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync(new URL('../script.js',import.meta.url),'utf8');
function speechCleaner() {
  const start=js.indexOf('function textForSpeech(value) {');
  const end=js.indexOf('\n}\n\nfunction speakAnswer(',start);
  assert(start>-1&&end>start,'Speech normalizer exists');
  const ctx={};
  vm.runInNewContext(js.slice(start,end+2)+'\nthis.clean=textForSpeech;',ctx);
  return ctx.clean;
}
test('Speech omits punctuation and symbol noise while preserving words in JP/Bangla/English',()=>{
  const clean=speechCleaner();
  const result=clean('📍 5F／501号室：ゲームをして、お菓子をＧｅｔ！ , *** =!|_{} [イベント](https://example.com/a?b=c) --- こんにちは。 বাংলায় পরীক্ষা!');
  assert.match(result,/5F 501号室/);
  assert.match(result,/ゲームをして お菓子をＧｅｔ/);
  assert.match(result,/イベント/);
  assert.match(result,/こんにちは/);
  assert.match(result,/বাংলায় পরীক্ষা/);
  assert.doesNotMatch(result,/[^\p{L}\p{M}\p{N}\s]/u);
  assert.doesNotMatch(result,/https|example/);
  assert.equal(clean('*** , ! = | _ { } 🤖 🚀'), '');
});
test('Shared cleaner is used in both the reply and welcome robot speech',()=>{
  assert.match(js,/const cleanText = textForSpeech\(text\)/);
  assert.match(js,/new SpeechSynthesisUtterance\(textForSpeech\(welcomeCompletedCycles/);
  assert.doesNotMatch(js,/"がくえんさい、エーアイ"/);
  assert.match(js,/"がくえんさい エーアイ"/);
});
test('Top menu Food/Game/Venue shortcuts use school sourced reply',()=>{
  assert.match(js,/会場ガイド/);
  assert.match(js,/\^場所\$/);
  assert.match(js,/window\.getTtcFestivalMenuAnswer = question =>/);
  assert.match(js,/const schoolAnswer = window\.getTtcFestivalMenuAnswer\?\.\(question\) \|\| ""/);
  assert.match(js,/ask\(question, schoolAnswer \? "ja-JP" : "", schoolAnswer\)/);
});

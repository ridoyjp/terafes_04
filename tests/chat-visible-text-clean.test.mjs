import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync(new URL('../script.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=js.indexOf('function cleanVisibleChatText(value) {');
const end=js.indexOf('\n}\n\nmessages.querySelectorAll',start);
assert(start>=0 && end>start);
const context={};
vm.runInNewContext(js.slice(start,end+2)+'\nthis.clean=cleanVisibleChatText',context);
const clean=context.clean;
test('Visible chat removes Japanese and Latin noise punctuation while keeping words and floor/room',()=>{
  assert.equal(clean('こんにちは！ *** ゲームは5F、501号室です。 =!|_{}'), 'こんにちは ゲームは5F 501号室です');
  assert.equal(clean('📍 5F／501号室：AI・ITゲーム 🤖'), '5F 501号室 AI ITゲーム');
  assert.equal(clean('বাংলায় কথা! *** Game, food =!|_{}'),'বাংলায় কথা Game food');
  assert.equal(clean('*** , =!|_{} 🎮'), '');
});
test('Retain distinct event lines and convert clock times and dates to readable Japanese',()=>{
  const output=clean('■ 生成AIによる目押しゲーム\n場所：5F／501号室\n時間：10:30～12:00\n日付：2026-11-09');
  assert.equal(output,'生成AIによる目押しゲーム\n場所 5F 501号室\n時間 10時30分 12時00分\n日付 2026年11月9日');
});
test('User and bot messages pass through sanitizer; initial welcome is clean',()=>{
  assert.match(js,/bubble\.textContent = cleanVisibleChatText\(text\)/);
  assert.match(js,/messages\.querySelectorAll\("\.bubble"\)/);
  assert.match(js,/add\(question, true\)/);
  assert.match(js,/add\(result\.text, false\)/);
  const welcome=html.match(/<div class="messages"[\s\S]*?<div class="bubble">([\s\S]*?)<\/div>/)?.[1];
  assert(welcome);
  assert.equal(clean(welcome),welcome.trim());
  assert.match(html,/script\.js\?v=20261112-sheet-only-v1/);
});
test('Voice cleaner is still in place and school data is not edited',()=>{
  assert.match(js,/const cleanText = textForSpeech\(text\)/);
  assert.match(js,/new SpeechSynthesisUtterance\(textForSpeech\(welcomeCompletedCycles/);
  assert.match(js,/window\.TTC_FESTIVAL_ACTIVITIES = activities/);
});

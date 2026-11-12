import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {js,html} from './helpers/current-menu.mjs';
const start=js.indexOf('function cleanVisibleChatText(value) {');
const end=js.indexOf('\n}\n\nmessages.querySelectorAll',start);
assert(start>=0&&end>start);
const ctx={};vm.runInNewContext(js.slice(start,end+2)+'\nthis.clean=cleanVisibleChatText',ctx);
const clean=ctx.clean;
test('Current chat keeps Japanese punctuation but strips markup and decorative symbols',()=>{
 const value=clean('こんにちは！ *** ゲームは5F、501号室です。 =!|_{}');
 assert.match(value,/こんにちは！/);assert.match(value,/5F、501号室です。/);
 assert.doesNotMatch(value,/\*\*|\{|\}|\|/);
});
test('School event lines and room identifiers survive sanitization',()=>{
 const value=clean('■ 展示\n場所：5F／501号室\n日時：2026-11-09 10:30');
 assert.match(value,/展示/);assert.match(value,/5F/);assert.match(value,/501号室/);
 assert.match(value,/2026年11月9日/);assert.match(value,/10時30分/);
});
test('User and bot bubbles retain sanitizer',()=>{
 assert.match(js,/bubble\.textContent = cleanVisibleChatText\(text\)/);
 assert.match(js,/messages\.querySelectorAll\("\.bubble"\)/);
 assert.match(js,/add\(question, true\)/);assert.match(js,/add\(result\.text, false\)/);
 assert.match(html,/id="messages"/);
});
test('Speech and XLSX sources are unchanged by visible text cleaner',()=>{
 assert.match(js,/function textForSpeech\(/);
 assert.match(js,/window\.TTC_FESTIVAL_ACTIVITIES = activities/);
});

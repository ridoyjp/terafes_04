import test from 'node:test';import assert from 'node:assert/strict';
import {buildMenu,data} from './helpers/current-menu.mjs';
test('All 34 activities, 21 source rows, 9 floors remain in the guide',()=>{
 const ui=buildMenu();assert.equal(data.entries.length,21);assert.equal(data.floors.length,9);
 assert.equal(ui.ctx.window.TTC_FESTIVAL_ACTIVITIES.length,34);
 assert.equal(ui.ctx.window.TTC_FESTIVAL_ROOM_CHOICES.length,16);
});
test('Room 501 displays original 4 activities and responsible department',()=>{
 const ui=buildMenu();ui.navTo('floors');ui.current().find(b=>b.textContent.includes('5F')).click();
 const btn=ui.current().find(b=>b.textContent.includes('501'));assert(btn);btn.click();
 const reply=ui.calls.at(-1).answer;
 for(const name of ['ホームページ制作','生成ＡＩを使ったアプリ','目押しゲーム','お菓子をＧｅｔ','情報処理科'])assert(reply.includes(name),name);
});
test('Joint 405 and 407 room info is not fabricated as individual assignments',()=>{
 const ui=buildMenu();ui.navTo('floors');ui.current().find(b=>b.textContent.includes('4F')).click();
 for(const room of ['405','407']){
  const btn=ui.current().find(b=>b.textContent.includes(room));assert(btn);btn.click();
  assert.match(ui.calls.at(-1).answer,/405号室と407号室/);
 }
});
test('Events without room numbers show only their actual floor',()=>{
 const ui=buildMenu();ui.navTo('all');const b=ui.current().find(n=>n.textContent.includes('入学相談コーナー'));assert(b);b.click();
 assert.match(ui.calls.at(-1).answer,/場所 1F/);assert.doesNotMatch(ui.calls.at(-1).answer,/部屋番号未記載/);
});

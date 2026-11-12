import test from 'node:test';import assert from 'node:assert/strict';
import {data,buildMenu,html} from './helpers/current-menu.mjs';
test('Current five-option menu preserves 34 activities across all 21 source entries',()=>{
 const ui=buildMenu();assert.equal(ui.nav.length,5);
 assert.equal(ui.ctx.window.TTC_FESTIVAL_ACTIVITIES.length,34);
 assert.equal(new Set(ui.ctx.window.TTC_FESTIVAL_ACTIVITIES.map(a=>a.entry.source_cells[0])).size,21);
 ui.navTo('all');assert.equal(ui.current().length,34);
});
test('Every event action produces a sheet-grounded local chat answer',()=>{
 const ui=buildMenu();ui.navTo('all');const items=[...ui.current()];
 for(const item of items){ui.calls.length=0;item.click();const ask=ui.calls.find(e=>e.type==='ask');assert(ask);
  assert.equal(ask.language,'ja-JP');assert.ok(ask.answer);assert.match(ask.answer,/場所/);
 }
});
test('Food / game / AI categories only include school-sourced activities',()=>{
 const ui=buildMenu();for(const type of ['food','games','ai']){ui.navTo(type);assert(ui.current().length>0);
   for(const button of ui.current()){ui.calls.length=0;button.click();assert(ui.calls.some(x=>x.type==='ask'&&x.answer));}}
});
test('Menu does not recreate removed quick-search UI',()=>{
 assert.match(html,/id="festivalMainOptions"/);assert.doesNotMatch(html,/id="festivalQuickSearch"/);
 assert.equal(data.entries.length,21);
});

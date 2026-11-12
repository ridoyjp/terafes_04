// Migrated from removed Quick Search to the current 5-button one-page menu.
import test from 'node:test';import assert from 'node:assert/strict';
import {buildMenu,html,css,data} from './helpers/current-menu.mjs';
test('The current menu exposes all school data without a search box',()=>{
 const ui=buildMenu();assert.equal(ui.nav.length,5);
 assert.doesNotMatch(html,/id="festivalQuickSearch"/);ui.navTo('all');assert.equal(ui.current().length,34);
});
test('Select all 34 named activities from the single-page list',()=>{
 const ui=buildMenu();ui.navTo('all');const all=[...ui.current()];
 assert.equal(all.length,34);
 for(const button of all){ui.calls.length=0;button.click();const c=ui.calls.find(c=>c.type==='ask');assert(c?.answer);assert.match(c.answer,/場所/);}
});
test('Every source row is represented by at least one activity button',()=>{
 const ui=buildMenu();const entries=new Set(ui.ctx.window.TTC_FESTIVAL_ACTIVITIES.map(x=>x.entry.source_cells[0]));
 assert.equal(entries.size,data.entries.length);
});
test('All menu choices are readable without Next/Previous pagination',()=>{
 const ui=buildMenu();ui.navTo('games');assert(ui.current().length>4);
 assert.equal(ui.nodes.festivalSuggestionCounter.textContent,'');assert.equal(ui.nodes.festivalSuggestionControls.children.length,1);
 assert.match(css,/festival-.*suggestion/i);
});

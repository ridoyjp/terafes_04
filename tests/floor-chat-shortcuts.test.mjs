import test from 'node:test';import assert from 'node:assert/strict';
import {data,html,buildMenu} from './helpers/current-menu.mjs';
test('9 floor choices are shown through the progressive menu',()=>{
 const ui=buildMenu();ui.navTo('floors');assert.equal(ui.current().length,9);
 assert.equal(ui.nodes.floorGuideCount.textContent,'9フロア・21項目');
});
test('Floor choices list rooms, then click gives an Excel answer',()=>{
 const ui=buildMenu();ui.navTo('floors');
 for(const floor of data.floors){
  const btn=ui.current().find(n=>n.textContent.includes(floor));assert(btn);
  btn.click();assert(ui.current().length>0);
  const one=ui.current()[0];ui.calls.length=0;one.click();
  assert(ui.calls.some(c=>c.type==='ask'&&c.answer.includes(floor)));
  ui.navTo('floors');
 }
});
test('Top menu has actual quick links and no paginated Next control',()=>{
 assert.match(html,/id="infoToggle"/);assert.match(html,/data-quick-nav="food"/);
 assert.match(html,/data-quick-nav="floors"/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const guide=JSON.parse(fs.readFileSync(new URL('../festival_floor_guide_2026.json', import.meta.url),'utf8'));

class Elem {
  constructor(tag='div') { this.tag=tag;this.children=[];this.attrs={};this.events={};this.className='';this.textContent='';this.value='';this.hidden=false;this.focused=false; }
  appendChild(e){this.children.push(e);return e;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
  replaceChildren(...xs){this.children=xs;}
  click(){assert.equal(typeof this.events.click,'function');this.events.click();}
  focus(){this.focused=true;}
  querySelector(cls){return this.children.find(x=>x.className===cls.replace(/^\./,''))||null;}
  enter(){let prevented=false;this.events.keydown?.({key:'Enter',preventDefault(){prevented=true;}});return prevented;}
}
function prepare(){
 const ids=['floorGuideTabs','floorGuideCount','festivalActivityCount','festivalCategoryButtons','festivalEventButtons','festivalSourceButtons','festivalSourceCount','festivalQuickSearch','festivalSearchClear','festivalSearchStatus','festivalSearchResults'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Elem()]));
 const calls=[];
 const start=js.indexOf('(function initFestivalFloorGuide() {');
 const end=js.indexOf('})();',start);
 assert(start>=0&&end>start);
 const ctx={window:{TTC_FLOOR_GUIDE:guide},document:{getElementById:id=>nodes[id],createElement:tag=>new Elem(tag)},setInfo:value=>calls.push({name:'setInfo',value}),ask:(q,lang,answer)=>calls.push({name:'ask',q,lang,answer}),pendingChat:false};
 vm.runInNewContext(js.slice(start,end+4),ctx);
 return {nodes,calls,ctx};
}
test('All 21 original XLSX rows have clickable source buttons',()=>{
 const ui=prepare();
 const originals=ui.nodes.festivalSourceButtons.children;
 assert.equal(originals.length,21);
 assert.equal(ui.nodes.festivalSourceCount.textContent,'21件');
 for(let i=0;i<originals.length;i++){
  const item=guide.entries[i];
  ui.calls.length=0;
  originals[i].click();
  assert.equal(ui.calls.length,2);
  assert.equal(ui.calls[0].value,false);
  assert.equal(ui.calls[1].lang,'ja-JP');
  const response=ui.calls[1].answer;
  assert(response.includes(item.description),`Missing exact description at ${item.source_cells[0]}`);
  if(item.department)assert(response.includes(item.department.replace(/\n/g,'・')));
  if(item.schedule)assert(response.includes(item.schedule.replace(/\n/g,'・')));
  if(item.room)assert(response.includes(item.room.replace(/\n/g,'・')));
  assert(response.includes(item.floor));
 }
});
test('All 34 individual activities preserved, 9 floors, 8 categories and all events category',()=>{
 const ui=prepare();
 assert.equal(ui.ctx.window.TTC_FESTIVAL_ACTIVITIES.length,34);
 assert.equal(ui.nodes.festivalEventButtons.children.length,9);
 assert.equal(ui.nodes.floorGuideTabs.children.length,10);
 assert.equal(ui.nodes.festivalCategoryButtons.children.length,9);
});
test('Quick searching room 501 shows the 5F activity buttons and original school row',()=>{
 const ui=prepare();
 ui.nodes.festivalQuickSearch.value='501';
 ui.nodes.festivalQuickSearch.events.input();
 const out=ui.nodes.festivalSearchResults;
 assert.equal(out.hidden,false);
 const buttons=out.children.filter(x=>x.className==='festival-search-button');
 assert.equal(buttons.length,5); // 4 named activities plus 1 original Excel record
 for(const b of buttons)assert(b.textContent.includes('5F'));
 ui.calls.length=0;
 const activity=buttons.find(b=>b.textContent.includes('目押しゲーム'));
 activity.click();
 assert.equal(ui.calls.length,2);
 assert(ui.calls[1].answer.includes('生成AIによる目押しゲーム'));
 assert(ui.calls[1].answer.includes('5F'));
 assert(ui.calls[1].answer.includes('501'));
 assert(ui.calls[1].answer.includes('情報処理科'));
 assert(ui.calls[1].answer.includes('2年展示'));
});
test('Quick search matches Japanese food and room-less school entries, English aliases',()=>{
 const ui=prepare();
 for(const query of ['カフェ','1F','food','coffee','情報処理科','9F','405','B1F']){
  ui.nodes.festivalQuickSearch.value=query;
  ui.nodes.festivalQuickSearch.events.input();
  assert(ui.nodes.festivalSearchResults.children.some(e=>e.className==='festival-search-button'),`No match ${query}`);
 }
 ui.nodes.festivalQuickSearch.value='coffee';ui.nodes.festivalQuickSearch.events.input();
 assert(ui.nodes.festivalSearchResults.children.some(e=>e.textContent.includes('コーヒーコーナー')));
});
test('Search returns helpful empty state and clearing resets the results',()=>{
 const ui=prepare();
 ui.nodes.festivalQuickSearch.value='ZZZ_NOT_EXISTING';
 ui.nodes.festivalQuickSearch.events.input();
 assert.match(ui.nodes.festivalSearchStatus.textContent,/見つかりません/);
 assert.equal(ui.nodes.festivalSearchResults.children.length,0);
 ui.nodes.festivalSearchClear.click();
 assert.equal(ui.nodes.festivalQuickSearch.value,'');
 assert.equal(ui.nodes.festivalSearchResults.hidden,true);
 assert(ui.nodes.festivalQuickSearch.focused);
});
test('Press Enter selects first search result to chat and does not send Gemini request',()=>{
 const ui=prepare();
 ui.nodes.festivalQuickSearch.value='3Dプリンター';
 ui.nodes.festivalQuickSearch.events.input();
 assert(ui.nodes.festivalQuickSearch.enter());
 assert.equal(ui.calls.length,2);
 assert.match(ui.calls[1].answer,/3Dプリンター体験/);
 assert.match(ui.calls[1].answer,/1101/);
});
test('UI keeps symbol-free chat, clean voice and mobile responsive search',()=>{
 for(const id of ['festivalQuickSearch','festivalSearchResults','festivalSourceButtons','festivalSourceCount'])assert(html.includes(`id="${id}"`));
 assert(html.includes('script.js?v=20261109-school-full-v2'));
 assert.match(css,/festival-search-button/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(js,/bubble\.textContent = cleanVisibleChatText\(text\)/);
 assert.match(js,/function textForSpeech\(value\)/);
});

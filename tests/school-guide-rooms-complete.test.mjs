import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const cwd = new URL('../', import.meta.url);
const src = fs.readFileSync(new URL('script.js',cwd),'utf8');
const html = fs.readFileSync(new URL('index.html',cwd),'utf8');
const guide = JSON.parse(fs.readFileSync(new URL('festival_floor_guide_2026.json',cwd),'utf8'));
class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.events={};this.textContent='';this.value='';this.hidden=false;this.className='';}
  setAttribute(k,v){this.attrs[k]=v;}
  appendChild(n){this.children.push(n);return n;}
  replaceChildren(...c){this.children=c;}
  addEventListener(k,f){this.events[k]=f;}
  click(){this.events.click?.();}
  focus(){}
  querySelector(s){return this.children.find(c=>c.className===s.replace(/^\./,''))??null;}
}
function setup(){
  const ids=['floorGuideTabs','floorGuideCount','festivalActivityCount','festivalCategoryButtons','festivalEventButtons','festivalSourceButtons','festivalSourceCount','festivalRoomButtons','festivalRoomCount','festivalQuickSearch','festivalSearchClear','festivalSearchStatus','festivalSearchResults'];
  const nodes=Object.fromEntries(ids.map(k=>[k,new Node()])); const calls=[];
  const start=src.indexOf('(function initFestivalFloorGuide() {');
  const end=src.indexOf('})();',start);
  assert(start>=0&&end>start);
  const context={window:{TTC_FLOOR_GUIDE:guide},document:{getElementById:id=>nodes[id],createElement:tag=>new Node(tag)},setInfo:v=>calls.push(['close',v]),ask:(q,l,a)=>calls.push(['ask',q,l,a]),pendingChat:false};
  vm.runInNewContext(src.slice(start,end+4),context);
  return {nodes,calls,context};
}
const flatten = (root, cls)=> { const out=[]; const visit=n=>{if(n.className===cls)out.push(n);for(const c of n.children??[])visit(c)};visit(root);return out};
const textOf = n => n.textContent+' '+(n.children??[]).map(textOf).join(' ');
test('Official guide contains 9 floors, 21 rows and 34 separate activities',()=>{
 const u=setup();assert.equal(guide.floors.length,9);assert.equal(guide.entries.length,21);assert.equal(u.context.window.TTC_FESTIVAL_ACTIVITIES.length,34);
 assert.equal(u.nodes.festivalSourceButtons.children.length,21);
 assert.equal(flatten(u.nodes.festivalEventButtons,'festival-event-button').length,34);
});
test('All 16 sheet-backed room buttons are clickable to chat',()=>{
 const u=setup();const buttons=flatten(u.nodes.festivalRoomButtons,'festival-room-button');assert.equal(buttons.length,16);
 assert.equal(u.context.window.TTC_FESTIVAL_ROOM_CHOICES.length,16);
 for(const b of buttons){u.calls.length=0;b.click();assert.equal(u.calls.length,2);assert.equal(u.calls[0][1],false);assert.equal(u.calls[1][0],'ask');assert.equal(u.calls[1][2],'ja-JP');assert.match(u.calls[1][3],/場所：/);}
});
test('Room 501 shows all four activities',()=>{
 const u=setup();const rooms=flatten(u.nodes.festivalRoomButtons,'festival-room-button');const b=rooms.find(b=>textOf(b).includes('501号室'));assert(b);
 const labels=textOf(b);for(const phrase of ['ホームページ制作展示','生成ＡＩを使ったアプリ','目押しゲーム','お菓子をＧｅｔ'])assert(labels.includes(phrase),phrase);
 b.click();assert(u.calls.at(-1)[3].includes('情報処理科'));
});
test('Room 405/407 both show six shared activities without inventing assignment',()=>{
 const u=setup();const rooms=flatten(u.nodes.festivalRoomButtons,'festival-room-button');
 for(const room of ['405号室','407号室']){const b=rooms.find(b=>textOf(b).includes(room));assert(b,room);const chips=flatten(b,'festival-room-activity-chip');assert.equal(chips.length,6,room);b.click();assert.match(u.calls.at(-1)[3],/個別に明記されていません/);}
});
test('Unspecified rooms are acknowledged and time/departments preserved',()=>{
 const u=setup();const rooms=flatten(u.nodes.festivalRoomButtons,'festival-room-button');
 assert.equal(rooms.filter(b=>textOf(b).includes('部屋番号未記載')).length,0);
 const mini=rooms.find(b=>textOf(b).includes('ミニゆるメカトロ'));assert(mini);mini.click();assert.match(u.calls.at(-1)[3],/11\/14/);
 const activities=u.context.window.TTC_FESTIVAL_ACTIVITIES;
 assert.equal(activities.filter(a=>!a.entry.room).length,6);
 assert.match(html,/学校のExcel 21掲載枠をすべて見る/);
});

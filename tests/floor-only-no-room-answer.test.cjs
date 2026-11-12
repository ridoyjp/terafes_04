const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(base,'script.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(base,'festival_floor_guide_2026.json'),'utf8'));
const start=code.indexOf('(function initFestivalFloorGuide() {');
const end=code.indexOf('})();',start);
assert(start>0 && end>start);
class MockNode {
  constructor(){this.children=[];this.events={};this.hidden=false;this.textContent='';this.dataset={};this.attrs={};}
  appendChild(x){this.children.push(x);return x;}
  replaceChildren(...xs){this.children=xs;}
  addEventListener(k,fn){this.events[k]=fn;}
  click(){this.events.click?.();}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelectorAll(){return [];}
}
const ids=['festivalMainOptions','festivalSuggestionChoices','festivalSuggestionControls','festivalSmartSuggestions','festivalSuggestionTitle','festivalSuggestionCounter','floorGuideCount','festivalActivityCount'];
const nodes=Object.fromEntries(ids.map(id=>[id,new MockNode()]));
const nav=['games','food','ai','floors','all'].map(v=>{const b=new MockNode();b.dataset.festivalNav=v;return b;});
nodes.festivalMainOptions.querySelectorAll=()=>nav;
let responses=[];
const context={ window:{TTC_FLOOR_GUIDE:data},document:{getElementById:id=>nodes[id]||null,createElement:()=>new MockNode(),querySelectorAll:()=>[]},pendingChat:false,closeInfoMenu:()=>{},ask:(q,lang,reply)=>responses.push({q,lang,reply})};
vm.runInNewContext(code.slice(start,end+4),context);
const all=context.window.TTC_FESTIVAL_ACTIVITIES;
assert.equal(all.length,34);
const absent=all.filter(x=>!x.entry.room);
assert.equal(absent.length,6);
// The menu and its event buttons must provide only the known floor for missing rooms.
nav[4].click();
const buttons=nodes.festivalSuggestionChoices.children;
for(const a of absent){
 const btn=buttons.find(b=>b.textContent.endsWith(' '+a.name));
 assert(btn,'Button missing for '+a.name);
 btn.click();
 const reply=responses.at(-1).reply;
 assert(reply.includes('場所 '+a.entry.floor),'Missing floor for '+a.name);
 assert(!/部屋番号未記載|部屋番号の記載なし|部屋番号は学校資料に記載されていません/.test(reply),'Unwanted room notice '+a.name);
 assert(!/場所 [^\n]*号室/.test(reply),'Invented room for '+a.name);
 assert(reply.includes(a.entry.description),'Lost original Excel description '+a.name);
}
const numbered=all.find(x=>x.entry.room==='501');
const btn=buttons.find(b=>b.textContent.endsWith(' '+numbered.name));
btn.click();
assert(responses.at(-1).reply.includes('場所 5F 501号室'));
console.log('PASS: 6 missing-room activities: floor only, 501 retains its room, 34 events exist');

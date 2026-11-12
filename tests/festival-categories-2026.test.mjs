import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const folder = new URL('../', import.meta.url);
const js = fs.readFileSync(new URL('script.js',folder),'utf8');
const html = fs.readFileSync(new URL('index.html',folder),'utf8');
const dataset = JSON.parse(fs.readFileSync(new URL('festival_floor_guide_2026.json',folder),'utf8'));
class FakeElement {
  constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.events={};this.className='';this.textContent='';}
  appendChild(child){this.children.push(child);return child;}
  setAttribute(key,value){this.attrs[key]=value;}
  addEventListener(name,fn){this.events[name]=fn;}
  click(){assert.ok(this.events.click);this.events.click();}
}
function buildUi(){
  const nodes = {floorGuideTabs:new FakeElement(),floorGuideCount:new FakeElement(),festivalActivityCount:new FakeElement(),festivalCategoryButtons:new FakeElement(),festivalEventButtons:new FakeElement()};
  const calls=[];
  const start=js.indexOf('(function initFestivalFloorGuide() {');
  const end=js.indexOf('})();',start);
  assert(start>=0&&end>start);
  const ctx={
    window:{TTC_FLOOR_GUIDE:dataset},
    document:{getElementById:id=>nodes[id],createElement:tag=>new FakeElement(tag)},
    setInfo:value=>calls.push({fn:'setInfo',value}),
    ask:(question,lang,localAnswer)=>calls.push({fn:'ask',question,lang,localAnswer}),
    pendingChat:false
  };
  vm.runInNewContext(js.slice(start,end+4),ctx);
  return {nodes,calls,ctx};
}
function checkChat(button,ui,required){
  ui.calls.length=0;
  button.click();
  assert.equal(ui.calls.length,2);
  assert.equal(ui.calls[0].fn,'setInfo');
  assert.equal(ui.calls[0].value,false);
  const ask=ui.calls[1];
  assert.equal(ask.fn,'ask');
  assert.equal(ask.lang,'ja-JP');
  assert.match(ask.localAnswer,/TTC FESTIVAL 2026/);
  for(const rec of required){
    assert.ok(ask.localAnswer.includes(rec.description.split('\n')[0]),`missing ${rec.source_cells[0]}`);
    assert.ok(ask.localAnswer.includes(rec.floor),`missing floor ${rec.floor}`);
    if(rec.department)assert.ok(ask.localAnswer.includes(rec.department.replace(/\n/g,'・')));
    if(rec.schedule)assert.ok(ask.localAnswer.includes(rec.schedule.replace(/\n/g,'・')));
  }
}

test('All 21 school records covered by 34 individually clickable named activities',()=>{
  const ui=buildUi();
  const panels=ui.nodes.festivalEventButtons.children;
  assert.equal(panels.length,9);
  const buttons=panels.flatMap(p=>p.children[1].children);
  const activities=ui.ctx.window.TTC_FESTIVAL_ACTIVITIES;
  assert.equal(buttons.length,34);
  assert.equal(activities.length,34);
  assert.equal(ui.nodes.festivalActivityCount.textContent,'34企画');
  assert.equal(new Set(buttons.map(b=>b.textContent)).size,34);
  assert.equal(new Set(activities.map(a=>a.entry.source_cells[0])).size,21);
  buttons.forEach((b,index)=>{
    assert(b.textContent.includes(activities[index].name));
    checkChat(b,ui,[activities[index].entry]);
    assert(ui.calls[1].localAnswer.includes(`■ ${activities[index].name}`));
  });
});

test('Food, games and six other category buttons return exact selected school entries',()=>{
  const ui=buildUi();
  const buttons=ui.nodes.festivalCategoryButtons.children;
  assert.equal(buttons.length,9);
  checkChat(buttons[0],ui,dataset.entries);
  const texts=buttons.map(b=>b.textContent);
  for(const label of ['ゲーム・遊び','フード・カフェ','AI・科学・IT','ものづくり・体験','展示・発表','建築・インテリア','アート・デザイン','相談・施設']) {
    assert(texts.some(t=>t.includes(label)),label);
  }
  const food=buttons.find(b=>b.textContent.includes('フード'));
  checkChat(food,ui,dataset.entries.filter(e=>['C12','D12'].includes(e.source_cells[0])));
  const game=buttons.find(b=>b.textContent.includes('ゲーム'));
  checkChat(game,ui,dataset.entries.filter(e=>['E2','B4','B5','B7','F7','B9','E9','B11'].includes(e.source_cells[0])));
  assert.match(ui.calls[1].localAnswer,/7F/);
  assert.match(html,/id="festivalCategoryButtons"/);
  assert.match(html,/id="festivalEventButtons"/);
});

test('Original floor shortcuts still deliver all 9 floors and exact Excel text',()=>{
  const ui=buildUi();
  const buttons=ui.nodes.floorGuideTabs.children;
  assert.equal(buttons.length,10);
  checkChat(buttons[0],ui,dataset.entries);
  dataset.floors.forEach((floor,i)=>checkChat(buttons[i+1],ui,dataset.entries.filter(e=>e.floor===floor)));
});

test('All category and individual-event buttons are inert while chat is busy',()=>{
  const ui=buildUi();
  ui.ctx.pendingChat=true;
  ui.nodes.floorGuideTabs.children[0].click();
  ui.nodes.festivalCategoryButtons.children[1].click();
  ui.nodes.festivalEventButtons.children[0].children[1].children[0].click();
  assert.equal(ui.calls.length,0);
});

test('Exact-school override is consumed in ask without going to Gemini',()=>{
  assert.match(js,/async function ask\(question, spokenLanguage = "", schoolGuideAnswer = ""\)/);
  assert.match(js,/const floorReply = schoolGuideAnswer \|\| window.answerTtcFloorGuide/);
});

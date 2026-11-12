import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { answerFloorGuide } from '../cloudflare-worker/src/floor-guide-data.js';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const source = JSON.parse(fs.readFileSync(new URL('../festival_floor_guide_2026.json', import.meta.url), 'utf8'));

class FakeElement {
  constructor(tag = 'div') { this.tag = tag; this.children = []; this.attrs = {}; this.events = {}; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, fn) { this.events[name] = fn; }
  appendChild(child) { this.children.push(child); return child; }
  click() { this.events.click(); }
}
function setup() {
  const tabs = new FakeElement();
  const count = new FakeElement();
  const calls = [];
  const start = js.indexOf('(function initFestivalFloorGuide() {');
  const end = js.indexOf('})();', start);
  assert(start >= 0 && end > start, 'Expected floor guide initializer');
  const ctx = {
    window: { TTC_FLOOR_GUIDE: source },
    document: {getElementById: id => ({floorGuideTabs: tabs, floorGuideCount: count}[id]), createElement: tag => new FakeElement(tag)},
    setInfo: value => calls.push({ method: 'setInfo', value }),
    ask: (question, language) => calls.push({ method: 'ask', question, language }),
    pendingChat: false
  };
  vm.runInNewContext(js.slice(start, end + 4), ctx);
  return { tabs, count, calls, ctx };
}

test('Ten floor buttons and school item count appear inside information list', () => {
  const ui = setup();
  assert.deepEqual(ui.tabs.children.map(el => el.textContent), ['全フロア',...source.floors]);
  assert.equal(ui.count.textContent, '9フロア・21項目');
  assert.match(html, /id="floorGuideTabs"/);
  assert.match(html, /id="floorGuideCards" hidden/);
  assert.match(html, /チャットに表示されます/);
});

test('Clicking each floor closes info panel and asks chat for that floor', () => {
  const ui = setup();
  for (const [index, btn] of ui.tabs.children.entries()) {
    ui.calls.length = 0;
    btn.click();
    assert.equal(ui.calls.length, 2, `Button ${index}`);
    assert.equal(ui.calls[0].method, 'setInfo');
    assert.equal(ui.calls[0].value, false);
    assert.equal(ui.calls[1].method, 'ask');
    assert.equal(ui.calls[1].language, 'ja-JP');
    const floor = index === 0 ? null : source.floors[index-1];
    const answer = answerFloorGuide(ui.calls[1].question, 'ja-JP');
    assert.ok(answer, `No local response for ${floor || 'all'}`);
    const matchingEntries = floor ? source.entries.filter(x => x.floor === floor) : source.entries;
    for (const entry of matchingEntries) {
      assert.ok(answer.includes(entry.description.split('\n')[0]), `Missing ${entry.floor} ${entry.room}`);
    }
    if (floor) assert.match(ui.calls[1].question, new RegExp(floor));
  }
});

test('Buttons do not close the panel or send a request if chat is busy', () => {
  const ui = setup();
  ui.ctx.pendingChat = true;
  ui.tabs.children[3].click();
  assert.equal(ui.calls.length, 0);
});

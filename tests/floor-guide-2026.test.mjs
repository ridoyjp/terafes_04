import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../cloudflare-worker/src/index.js';
import { FLOOR_GUIDE, answerFloorGuide } from '../cloudflare-worker/src/floor-guide-data.js';

const source = JSON.parse(fs.readFileSync(new URL('../festival_floor_guide_2026.json', import.meta.url), 'utf8'));

test('All 21 source entries and 9 floor labels are present', () => {
  assert.equal(source.entries.length, 21);
  assert.equal(source.floors.length, 9);
  assert.deepEqual(FLOOR_GUIDE.entries, source.entries);
  assert.deepEqual(FLOOR_GUIDE.floors, source.floors);
  assert.equal(source.source_rows.length, 13);
  assert(source.source_rows[0].cells.A.includes('TTC FESTIVAL'));
});

test('Room and floor lookup use the exact XLSX descriptions', () => {
  assert.match(answerFloorGuide('501号室は何がありますか'), /生成ＡＩを使ったアプリ展示と閲覧/);
  assert.match(answerFloorGuide('11F 1103'), /異文化交流ボドゲカフェ/);
  assert.match(answerFloorGuide('7階で何がある'), /11\/14（土）11:00 - 13:00/);
  assert.match(answerFloorGuide('6階で何がある'), /11\/15（日）/);
  assert.match(answerFloorGuide('405号室'), /カゼインプラスチック作り/);
  assert.match(answerFloorGuide('B1F'), /建築系学科 成果展示会/);
  assert.match(answerFloorGuide('1階'), /世界のお菓子コーナー/);
});

test('Unlisted information is not invented', () => {
  assert.equal(answerFloorGuide('開催時間を教えて'), null);
  assert.equal(answerFloorGuide('学校の住所を教えて'), null);
  assert.match(answerFloorGuide('トイレはどこですか'), /記載がありません/);
  assert.match(answerFloorGuide('ステージについて教えて'), /記載がありません/);
});

test('Frontend information list references all local assets', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const js = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
  assert.match(html, /id="floorGuideTabs"/);
  assert.match(html, /id="floorGuideCards"/);
  assert.match(html, /festival-floor-guide\.js\?v=/);
  assert.match(js, /window\.answerTtcFloorGuide/);
  assert(fs.existsSync(new URL('../festival-floor-guide.js', import.meta.url)));
});

test('Worker answers sourced floor questions without a Gemini key', async () => {
  const req = new Request('https://example.workers.dev/chat', {
    method:'POST', headers:{ Origin:'https://ridoyjp.github.io', 'Content-Type':'application/json' },
    body:JSON.stringify({ message:'5階の501号室は何ですか', responseLanguage:'ja-JP' })
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.informationStatus, 'SCHOOL_FLOOR_GUIDE_2026');
  assert.match(data.reply, /情報処理科/);
});

test('Worker keeps unlisted general opening hours unverified', async () => {
  const req = new Request('https://example.workers.dev/chat', {
    method:'POST', headers:{ Origin:'https://ridoyjp.github.io', 'Content-Type':'application/json' },
    body:JSON.stringify({ message:'2026年の学園祭はいつ？', responseLanguage:'ja-JP' })
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.informationStatus, 'UNVERIFIED_2026');
});

/**
 * TTC 学園祭 AI — Final Professional Update V3.
 * Apply from the root of the user's Git clone. No network requests, no API keys.
 * Edits are validated before any writes. Existing festival approval records are preserved.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const paths = {
  script: path.join(root, 'script.js'),
  html: path.join(root, 'index.html'),
  css: path.join(root, 'style.css'),
  school: path.join(root, 'school_information.json'),
  worker: path.join(root, 'cloudflare-worker', 'src', 'school-data.js'),
};
assert(fs.existsSync(path.join(root, '.git')), 'Run this from C:\\terafes_04_fresh (Git clone), not C:\\Users\\freel.');
for (const [name, file] of Object.entries(paths)) assert(fs.existsSync(file), `Missing ${name}: ${file}`);
const original = Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(p,'utf8')]));
const eol = Object.fromEntries(Object.entries(original).map(([k,v])=>[k,v.includes('\r\n')?'\r\n':'\n']));
const normal = k => original[k].replace(/\r\n/g,'\n');
let script = normal('script');
let html = normal('html');
let css = normal('css');

const marker = 'TTC FINAL PROFESSIONAL V3 — compact start button';
if (!css.includes(marker)) {
  css += `\n/* ${marker}: retains the original brand and robot. */
.intro #startButton {
  width: min(100%, 390px) !important;
  max-width: 390px !important;
  min-height: 52px;
  padding: 12px 24px !important;
  font-size: clamp(14px, 1.2vw, 17px) !important;
  border-radius: 16px !important;
  touch-action: manipulation;
}
@media (max-width: 600px) {
  .intro #startButton {
    width: min(78vw, 320px) !important;
    max-width: 320px !important;
    min-height: 50px !important;
    padding: 12px 20px !important;
    font-size: 15px !important;
  }
}
@media (max-width: 360px) {
  .intro #startButton { width: min(82vw, 288px) !important; }
}
@media (prefers-reduced-motion: reduce) {
  .intro #startButton { animation: none !important; }
}
`;
}
const voiceMarker = 'TTC FINAL PROFESSIONAL V3: retry autoplay once after voices load';
if (!script.includes(voiceMarker)) {
  const anchor = '    document.addEventListener("visibilitychange", () => {';
  assert(script.includes(anchor), 'Unsupported script.js voice version; no files changed.');
  script = script.replace(anchor, `    // ${voiceMarker}. Browser autoplay policy still applies.
    let welcomeVoiceRetriedAfterVoices = false;
    const tryWelcomeAfterVoiceListReady = () => {
      if (welcomeVoiceRetriedAfterVoices || welcomeUnlocked || welcomeStarted || welcomeMuted || !isWelcomeVisible()) return;
      welcomeVoiceRetriedAfterVoices = true;
      playWelcomeSpeech(); // best effort; user gesture may still be required
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", tryWelcomeAfterVoiceListReady);
${anchor}`);
}
// Cache-bust both resources; avoid changing the UI or script execution order.
html = html.replace(/(href="style\.css\?v=)[^"\s]+/g, '$1'+'20261022-final-pro-v3');
html = html.replace(/(src="script\.js\?v=)[^"\s]+/g, '$1'+'20261022-final-pro-v3');
assert(html.includes('style.css?v=20261022-final-pro-v3') && html.includes('script.js?v=20261022-final-pro-v3'), 'Missing CSS/JS tags; no files changed.');

const schoolData = JSON.parse(original.school);
const workerMatch = normal('worker').match(/export const SCHOOL_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
assert(workerMatch, 'Worker school data is not JSON-export format; no files changed.');
const workerData = JSON.parse(workerMatch[1]);
assert(Array.isArray(schoolData.entries) && Array.isArray(workerData.entries), 'School entries not found.');
const topics = new Map();
// Preserve the more extensive Worker knowledge base, including teacher-provided records.
for (const entry of workerData.entries) topics.set(entry.topic, entry);
for (const entry of schoolData.entries) if (!topics.has(entry.topic)) topics.set(entry.topic, entry);
const verified = [
  {
    topic: '2027年度募集と出願情報',
    keywords: ['2027','2027年度','募集要項','募集定員','願書','出願期間','出願','入試','application','admission','ভর্তি','আবেদন'],
    text: '学校公式の「募集要項・スケジュール」では2027年度生の募集学科・募集定員・出願スケジュールを案内。学科ごとに募集定員があり、定員に達すると早期に締め切る場合がある。募集条件・日付・定員は年度で変わるため、希望年度の最新公式ページを確認する。',
    source: 'https://tec.ttc.ac.jp/entrance/schedule/', verified: true
  },
  {
    topic: '情報処理科の学習内容',
    keywords: ['情報処理科','プログラミング','プログラム','ネットワーク','データベース','Webアプリ','カリキュラム','授業','information processing','software','curriculum','আইটি','প্রোগ্রামিং'],
    text: '情報処理科は2年制の専門士課程。公式学科案内ではプログラミング、データベース、ネットワーク、設計、AI・IoT・Webアプリケーションの学習を紹介。授業科目表や年度別シラバスは学校の公式ページ・公開情報で確認する。',
    source: 'https://tec.ttc.ac.jp/departments/it-game-web/data-processing/', verified: true
  },
  {
    topic: '留学生の出願と支援',
    keywords: ['留学生','外国人','日本語学校','学校推薦','指定校推薦','一般入学','奨学金','学費減免','international students','international admission','scholarship','বিদেশি','স্কলারশিপ'],
    text: '留学生向け公式募集要項では、指定校推薦入学、学校推薦入学、一般入学の出願方法を紹介。留学生向けの奨学金、学費減免、学習・生活支援の案内ページもある。対象条件や必要書類は個別に公式募集要項で確認する。',
    source: 'https://tec.ttc.ac.jp/entrance/international-students/', verified: true
  },
  {
    topic: '学科の募集停止・新設時期',
    keywords: ['2028','環境インフラ','夜間','建築士専科','募集停止','新設','開講','course opening','night school'],
    text: '公式学科紹介では環境インフラエンジニア科を2028年4月開講予定と案内。建築科（夜間 建築士専科）は2026年度生より募集停止と記載。通信制の建築科／建築士専科とは区別する。',
    source: 'https://tec.ttc.ac.jp/departments/', verified: true
  },
  {
    topic: '公式アクセス・連絡先（再確認）',
    keywords: ['東中野','アクセス','学校住所','住所','電話番号','連絡先','落合','中井','address','phone','station','অবস্থান','ঠিকানা'],
    text: '〒164-8787 東京都中野区東中野4-2-3。代表電話03-3360-8881。JR中央・総武線「東中野駅」東口駅前、都営大江戸線「東中野駅」A1出口徒歩1分、東京メトロ東西線「落合駅」徒歩8分、西武新宿線「中井駅」徒歩13分。',
    source: 'https://tec.ttc.ac.jp/school/access/', verified: true
  }
];
for (const entry of verified) topics.set(entry.topic, entry);
// Remove an example tuition total from a legacy entry; its applicable year was not specified.
if (topics.has('学費・納入方法')) {
  const old = topics.get('学費・納入方法');
  topics.set(old.topic, {...old,
    text: '学費・諸費用は学科・入学年度によって異なり、授業料以外に教科書・教材・ソフトウェア等の費用が必要な場合がある。正確な納付額・対象年度・分納条件は学校公式の学費・諸費用ページで確認する。',
    source: 'https://tec.ttc.ac.jp/entrance/expenses/', verified: true});
}
const merged = {...schoolData, checked_on:'2026-10-22',
  status:'一般学校情報は学校公式ページに基づく。学園祭2026の開催日・出店・料金・会場・安全情報は担当教員の承認が必要。',
  officialSources: {
    ...(schoolData.officialSources || {}),
    school:'https://tec.ttc.ac.jp/',
    departments:'https://tec.ttc.ac.jp/departments/',
    access:'https://tec.ttc.ac.jp/school/access/',
    informationProcessing:'https://tec.ttc.ac.jp/departments/it-game-web/data-processing/',
    admissions:'https://tec.ttc.ac.jp/entrance/schedule/',
    internationalAdmissions:'https://tec.ttc.ac.jp/entrance/international-students/',
    tuition:'https://tec.ttc.ac.jp/entrance/expenses/',
    openCampus:'https://tec.ttc.ac.jp/open-campus/',
    disclosure:'https://tec.ttc.ac.jp/school/disclosure/'
  },
  entries: Array.from(topics.values())};
assert(merged.entries.filter(e=>e.verified === false).length >= 5, 'Unverified festival records unexpectedly missing.');
assert(merged.entries.length >= 30, 'School records unexpectedly reduced.');
const next = {
  script, html, css,
  school: JSON.stringify(merged,null,2)+'\n',
  worker: '// TTC School Knowledge Base — official sources reviewed 2026-10-22; festival requires teacher approval\nexport const SCHOOL_DATA = '+JSON.stringify(merged,null,2)+';\n'
};
const changed = Object.keys(paths).filter(k=>next[k].replace(/\n/g,eol[k]) !== original[k]);
if (changed.length) {
  const backupDir = path.join(root,'.git','gakuen-final-pro-v3-backup');
  fs.mkdirSync(backupDir,{recursive:true});
  for (const k of changed) {
    const safeName = k+'-'+path.basename(paths[k]);
    const backup = path.join(backupDir,safeName);
    if (!fs.existsSync(backup)) fs.writeFileSync(backup,original[k]);
  }
  for (const k of changed) fs.writeFileSync(paths[k],next[k].replace(/\n/g,eol[k]));
}
console.log(`[GAKUEN FINAL V3] ${changed.length ? 'UPDATED: '+changed.join(', ') : 'Already up-to-date. No changes.'}`);
console.log(`[GAKUEN FINAL V3] School topics: ${merged.entries.length}; unverified festival records retained.`);
console.log('[GAKUEN FINAL V3] Autoplay best-effort only: Chrome/iPhone may require first user tap.');

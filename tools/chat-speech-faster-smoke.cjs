
const fs=require('fs'), vm=require('vm'), assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const a=source.indexOf('function speechInputText(value) {');
const b=source.indexOf('// Small session token prevents previous timed fragments',a);
const sandbox={};vm.createContext(sandbox);vm.runInContext(source.slice(a,b),sandbox);
const speech=sandbox.naturalSpeechText('データサイエンス体験ブース\n場所 11F 1103号室\n担当 IoT AI科\n学校資料の記載内容\nデータサイエンス体験ブース');
assert.equal(speech,'データサイエンス体験ブース、 場所 11階 1103号室、 担当 IoT AI科、 学校資料の記載内容、 データサイエンス体験ブース');
assert.equal(sandbox.speechSegments(speech).length,1);
assert.equal(sandbox.naturalSpeechText('こんにちは。\nゲームは5Fです。'),'こんにちは。 ゲームは5階です。');
assert.equal(sandbox.naturalSpeechText('ゲームは5F、501号室です。 *** =!|_{}'),'ゲームは5階、501号室です。');
assert(source.includes('const JAPANESE_VOICE_RATE = 1.08'));
assert(source.includes('const WELCOME_VOICE_RATE = 0.98'));
assert(!source.includes('setTimeout(next, chunk.pause)'));
console.log('Custom smoother/faster chat voice checks: 7/7 PASS');

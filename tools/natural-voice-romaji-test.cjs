const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const source=fs.readFileSync(__dirname+'/../script.js','utf8');
const a=source.slice(source.indexOf('function isJapaneseRomaji('), source.indexOf('function detectWrittenLanguage('));
const b=source.slice(source.indexOf('function cleanVisibleChatText('), source.indexOf('messages.querySelectorAll(".bubble")'));
const c=source.slice(source.indexOf('function speechInputText('), source.indexOf('// Small session token'));
const sandbox={};vm.createContext(sandbox);vm.runInContext(a+b+c,sandbox);
let checked=0;
function eq(actual,expected,label){assert.equal(actual,expected,label); checked++; console.log('PASS:',label,JSON.stringify(actual));}
function yes(condition,label){assert.ok(condition,label);checked++;console.log('PASS:',label);}
eq(sandbox.prepareTypedQuestion('gakuensai no geemu wa doko desu ka?'), '学園祭のゲームはどこですか？', 'Romaji festival question');
eq(sandbox.prepareTypedQuestion('konnichiwa!'), 'こんにちは！', 'Romaji greeting');
eq(sandbox.prepareTypedQuestion('watashi wa gakkou ni ikimasu.'), 'わたしは学校にいきます。', 'Romaji school sentence');
eq(sandbox.prepareTypedQuestion('Where is the game?'), 'Where is the game?', 'English preserved');
eq(sandbox.prepareTypedQuestion('Where is gakuensai?'), 'Where is gakuensai?', 'English with a Japanese event word preserved');
eq(sandbox.prepareTypedQuestion('学校はどこですか？'), '学校はどこですか？', 'Native Japanese preserved');
eq(sandbox.prepareTypedQuestion('আমি বাংলা বলি'), 'আমি বাংলা বলি', 'Bengali preserved');
eq(sandbox.cleanVisibleChatText('こんにちは！ *** ゲームは5F、501号室です。 =!|_{}'), 'こんにちは！ ゲームは5F、501号室です。', 'Visible Japanese punctuation, remove noisy symbols');
eq(sandbox.textForSpeech('こんにちは！ *** ゲームは5F、501号室です。 =!|_{}'), 'こんにちは ゲームは5階 501号室です', 'TTS input has no punctuation');
const chunks=sandbox.speechSegments('こんにちは！ゲームは5F、501号室です。次は11Fです。');
eq(chunks.length,1,'Natural Japanese paragraphs stay in one utterance');
eq(chunks[0].text,'こんにちは！ゲームは5階、501号室です。次は11階です。','Full Japanese text is read continuously');
eq(chunks[0].pause,0,'No artificial delay between short sentences');
yes(sandbox.speechSegments('11/14 11:00～16:00')[0].text.includes('11月14日'), 'Date rendered as spoken Japanese words');
yes(chunks.every(x=>!/[=*|_{}]/u.test(x.text)),'Decorative symbols never enter utterances');
console.log('TOTAL',checked);

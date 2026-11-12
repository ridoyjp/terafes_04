import test from 'node:test';import assert from 'node:assert/strict';
import {js} from './helpers/current-menu.mjs';
test('Natural speech normalizer and Japanese voice remain available',()=>{
 assert.match(js,/function textForSpeech\(/);assert.match(js,/function speakAnswer\(/);
 assert.match(js,/SpeechSynthesisUtterance/);assert.match(js,/ja-JP/);
});
test('Speaker cancellation and reply voice remain wired',()=>{
 assert.match(js,/stopReplySpeech/);assert.match(js,/soundButton/);
 assert.match(js,/speakAnswer\(result\.text, lastQuestionLanguage\)/);
});
test('Home welcome robot and local quick questions stay active',()=>{
 assert.match(js,/playWelcomeSpeech/);assert.match(js,/window\.getTtcFestivalMenuAnswer = question =>/);
 assert.match(js,/const schoolAnswer = window\.getTtcFestivalMenuAnswer\?\.\(question\) \|\| ""/);
});

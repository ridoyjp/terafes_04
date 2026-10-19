"use strict";
const $ = id => document.getElementById(id);
const intro=$('intro'),chat=$('chat'),messages=$('messages'),input=$('input'),status=$('voiceStatus');
const synth=window.speechSynthesis, hasSpeech=!!synth && 'SpeechSynthesisUtterance' in window;
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const WELCOME_SPEECH="こんにちは！TTC学園祭、エーアイチャットボットへようこそ！日本語をはじめ、さまざまな言語で質問できます。音声でも文字でも、お気軽に質問してください！";
let welcomeMuted=false, welcomeLoop=false, welcomeTimer=null, currentUtterance=null, answerSoundOn=true, lastAnswer='', mic=null, listening=false, pending=false;
const history=[];
function notify(message){status.hidden=false;status.textContent=message;}
function isWelcomeVisible(){return !intro.hidden && !chat.classList.contains('active');}
function stopAudio(){clearTimeout(welcomeTimer); welcomeTimer=null; currentUtterance=null; if(hasSpeech)synth.cancel();}
function voices(){return hasSpeech ? synth.getVoices():[];}
function voiceFor(lang){const base=lang.split('-')[0].toLowerCase();return voices().find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices().find(v=>v.lang.toLowerCase().split('-')[0]===base)||null;}
function langFor(text){if(/[\u0980-\u09ff]/.test(text))return 'bn-BD';if(/[\u3040-\u30ff\u3400-\u9fff]/.test(text))return 'ja-JP';return $('speechLanguage').value;}
function speak(text,lang,opts={}){
  if(!hasSpeech){notify('Speech playback is unsupported in this browser.');return false;}
  const targetVoice=voiceFor(lang);
  if(lang.startsWith('bn')&&!targetVoice){notify('বাংলা voice এই browser/device-এ নেই। Bengali TTS voice install করুন বা Bengali-supported device ব্যবহার করুন।');return false;}
  stopAudio();
  let utter=new SpeechSynthesisUtterance(text);
  utter.lang=lang;utter.rate=lang.startsWith('ja')?1.08:1;utter.pitch=1;
  if(targetVoice)utter.voice=targetVoice;
  currentUtterance=utter;
  utter.onerror=(e)=>{if(currentUtterance!==utter)return;currentUtterance=null; if(e.error!=='canceled'&&e.error!=='interrupted')notify('音声の再生に失敗しました: '+e.error+' / Voice unavailable');};
  utter.onend=()=>{if(currentUtterance!==utter)return;currentUtterance=null;if(opts.loop&&welcomeLoop&&!welcomeMuted&&isWelcomeVisible())welcomeTimer=setTimeout(playWelcome,800);};
  try{synth.speak(utter);return true;}catch(e){notify('Voice error: '+e.message);return false;}
}
function playWelcome(){if(welcomeMuted||!isWelcomeVisible())return;welcomeLoop=true;speak(WELCOME_SPEECH,'ja-JP',{loop:true});}
function updateWelcomeUI(){$('welcomeVoiceButton').textContent=welcomeMuted?'🔇 Welcome OFF':'🔊 Welcome ON';$('welcomeVoiceHint').textContent=welcomeMuted?'音声オフ':'音が出ない場合は Replay を押してください。';}
$('welcomeVoiceButton').addEventListener('click',()=>{welcomeMuted=!welcomeMuted;updateWelcomeUI();if(welcomeMuted){welcomeLoop=false;stopAudio();}else playWelcome();});
$('welcomeReplayButton').addEventListener('click',()=>{welcomeMuted=false;updateWelcomeUI();playWelcome();});
$('startButton').addEventListener('click',()=>{welcomeLoop=false;stopAudio();intro.hidden=true;chat.classList.add('active');input.focus();});
$('backButton').addEventListener('click',()=>{if(mic&&listening)mic.stop();stopAudio();chat.classList.remove('active');intro.hidden=false;welcomeMuted=false;updateWelcomeUI();playWelcome();});
// Autoplay is attempted for desktop, while mobile browser policies may require a tap.
window.addEventListener('load',()=>{if(hasSpeech){synth.getVoices();setTimeout(()=>{if(isWelcomeVisible())playWelcome()},450);}});
window.addEventListener('pagehide',stopAudio);
document.addEventListener('visibilitychange',()=>{if(document.hidden){welcomeLoop=false;stopAudio();}});
function addMessage(text,who){const row=document.createElement('div');row.className='row'+(who==='user'?' user':'');const avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=who==='user'?'👤':'🤖';const bubble=document.createElement('div');bubble.className='bubble';bubble.append(document.createTextNode(text));if(who==='bot'){const replay=document.createElement('button');replay.type='button';replay.className='replay-inline';replay.textContent='🔊 Replay / আবার শুনুন';replay.addEventListener('click',()=>speak(text,langFor(text)));bubble.append(replay);}row.append(avatar,bubble);messages.append(row);messages.scrollTop=messages.scrollHeight;return row;}
function fallback(q){if(/[\u0980-\u09ff]/.test(q))return 'AI সার্ভার এখন সংযুক্ত নেই। অনুগ্রহ করে পরে চেষ্টা করুন। উৎসবের সঠিক তথ্যের জন্য অফিসিয়াল নোটিশ দেখুন।';if(/food|食べ|フード/i.test(q))return '屋台・フードの詳細は学校の公式案内をご確認ください。';if(/game|ゲーム/i.test(q))return 'ゲームや体験コーナーについては学園祭の会場案内をご確認ください。';if(/ステージ|stage/i.test(q))return 'ステージの時間や内容は学校の公式案内をご確認ください。';return 'AIへの接続が設定されていないか、現在利用できません。学校の公式案内もご確認ください。';}
async function answer(q){const endpoint=String(window.CHATBOT_WORKER_URL||'').trim().replace(/\/$/,'');if(!endpoint)return fallback(q);try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);try{const resp=await fetch(endpoint.endsWith('/chat')?endpoint:endpoint+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history:history.slice(-12)}),signal:controller.signal});if(!resp.ok)throw new Error('HTTP '+resp.status);const data=await resp.json();const result=data.reply||data.response||data.answer||data.text||data.message;if(!result||typeof result!=='string')throw new Error('empty response');return result;}finally{clearTimeout(timer);}}catch(e){notify('AI connection: '+e.message);return fallback(q);}}
async function send(q){q=String(q||'').trim();if(!q||pending)return;stopAudio();input.value='';addMessage(q,'user');history.push({role:'user',content:q});pending=true;const wait=addMessage('考え中…','bot');let text=await answer(q);wait.remove();addMessage(text,'bot');history.push({role:'assistant',content:text});lastAnswer=text;pending=false;if(answerSoundOn)speak(text,langFor(text));}
$('form').addEventListener('submit',e=>{e.preventDefault();send(input.value);});
document.querySelectorAll('[data-q]').forEach(button=>button.addEventListener('click',()=>{if($('infoList'))$('infoList').hidden=true;send(button.dataset.q);}));
function toggleInfo(show){$('infoList').hidden=!show;$('infoToggle').setAttribute('aria-expanded',String(show));}
$('infoToggle').addEventListener('click',()=>toggleInfo($('infoList').hidden));$('infoClose').addEventListener('click',()=>toggleInfo(false));
$('soundButton').addEventListener('click',()=>{answerSoundOn=!answerSoundOn;$('soundButton').textContent=answerSoundOn?'🔊':'🔇';$('soundButton').setAttribute('aria-pressed',String(answerSoundOn));if(!answerSoundOn)stopAudio();notify(answerSoundOn?'Voice answers ON':'Voice answers OFF');});
$('replayAnswerButton').addEventListener('click',()=>{if(lastAnswer)speak(lastAnswer,langFor(lastAnswer));else notify('まだ回答がありません / এখনো উত্তর নেই।');});
$('speechLanguage').addEventListener('change',()=>{if(listening&&mic)mic.stop();notify('Voice language: '+$('speechLanguage').selectedOptions[0].text);});
if(!Recognition){$('micButton').disabled=true;$('micButton').title='Voice recognition not supported; type a question instead.';}
else $('micButton').addEventListener('click',()=>{
  if(listening){mic.stop();return;}
  stopAudio();mic=new Recognition();mic.lang=$('speechLanguage').value;mic.interimResults=false;mic.continuous=false;
  mic.onstart=()=>{listening=true;$('micButton').classList.add('is-listening');notify('🎙️ Listening… '+mic.lang);};
  mic.onresult=e=>{const transcript=[...e.results].map(r=>r[0].transcript).join(' ');input.value=transcript;notify('Recognized: '+transcript);};
  mic.onerror=e=>{notify('Microphone: '+e.error+' — Check mic permissions or use text input.');};
  mic.onend=()=>{listening=false;$('micButton').classList.remove('is-listening');};
  try{mic.start();}catch(e){notify('Microphone: '+e.message);}
});


const infoList=document.getElementById('infoList');const infoToggle=document.getElementById('infoToggle');function setInfo(open){infoList.hidden=!open;infoToggle.setAttribute('aria-expanded',String(open));}infoToggle.addEventListener('click',()=>setInfo(infoList.hidden));document.getElementById('infoClose').addEventListener('click',()=>setInfo(false));document.querySelectorAll('#infoList [data-q]').forEach(b=>b.addEventListener('click',()=>setInfo(false)));
document.getElementById('introLogo').src=document.querySelector('.head img').src;
document.getElementById('backButton').addEventListener('click',()=>{document.getElementById('chat').classList.remove('active');document.getElementById('intro').hidden=false;document.getElementById('startButton').focus();});
document.getElementById('startButton').addEventListener('click',()=>{document.getElementById('intro').hidden=true;document.getElementById('chat').classList.add('active');document.getElementById('input').focus();});
const BOT_ICON='assets/robot-logo.png';const messages=document.getElementById('messages'),input=document.getElementById('input');function add(t,user){const row=document.createElement('div');row.className='row'+(user?' user':'');const av=document.createElement('span');av.className='avatar';if(user){av.textContent='👤';}else{av.classList.add('bot-icon');const img=document.createElement('img');img.src=BOT_ICON;img.alt='Chatbot';av.appendChild(img);}const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=t;row.append(av,bubble);messages.append(row);messages.scrollTop=messages.scrollHeight}function answer(q){const s=q.toLowerCase();if(/食|food|飲|屋台|グルメ|たべ/.test(s))return '🍜 食べ物コーナーでは屋台グルメやドリンクを楽しめます。詳しい出店場所・メニューは当日の案内をご確認ください。';if(/ゲーム|game|遊|体験/.test(s))return '🎮 ゲームや体験型ブースを楽しめます！詳細は会場の案内をご確認ください。';if(/ステージ|stage|音楽|ライブ|発表/.test(s))return '🎤 ステージイベントや発表については公式スケジュールをご確認ください。';if(/場所|どこ|地図|map|トイレ|休憩|guide/.test(s))return '🗺️ 会場の案内掲示をご確認ください。スタッフにもお尋ねください！';if(/時間|いつ|日程|開催/.test(s))return '🕒 開催日時は学校からの公式案内をご確認ください。';if(/おすすめ|recommend/.test(s))return '🎉 屋台グルメ🍜、ゲーム体験🎮、ステージ🎤がおすすめです！どれが気になりますか？';if(/こんにちは|hello|hi/.test(s))return 'こんにちは！😊 学園祭について何を知りたいですか？';return '🎉「食べ物」「ゲーム」「ステージ」「場所」「おすすめ」などについて質問してください！'}function ask(q){q=q.trim();if(!q)return;add(q,true);(()=>{const typing=document.createElement('div');typing.className='row bot-typing';typing.setAttribute('aria-label','返信を入力中');typing.innerHTML='<span class="avatar bot-icon"><img src="assets/robot-logo.png" alt="Chatbot"></span><div class="bubble"><span class="typing-indicator"><span></span><span></span><span></span></span></div>';messages.append(typing);messages.scrollTop=messages.scrollHeight;setTimeout(()=>{typing.remove();add(answer(q),false);speakAnswer(answer(q))},Math.min(1050,450+q.length*22))})()}document.getElementById('form').addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value=''});document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.q)));


document.querySelectorAll('.desktop-sidebar [data-q]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.q)));


/* vNext effects — independent of festival Q&A logic */
(()=>{
 const intro=document.getElementById('intro');
 if(intro){
  const light=document.createElement('div');light.className='light-follow';intro.prepend(light);
  const field=document.createElement('div');field.className='spark-field';field.setAttribute('aria-hidden','true');
  for(let i=0;i<24;i++){
   const dot=document.createElement('span');dot.className='spark';
   const x=(i*37+13)%100,y=(i*23+9)%100;
   dot.style.cssText=`--x:${x}%;--y:${y}%;--s:${2+i%4}px;--d:${4+i%5}s;--delay:${-(i*0.37)}s`;
   field.append(dot);
  }
  intro.prepend(field);
  intro.addEventListener('pointermove',e=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=intro.getBoundingClientRect();intro.style.setProperty('--mouse-x',`${e.clientX-r.left}px`);intro.style.setProperty('--mouse-y',`${e.clientY-r.top}px`)});
 }
 document.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn||document.body.classList.contains('motion-off')||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=btn.getBoundingClientRect(),p=document.createElement('span');p.className='ripple';p.style.left=`${e.clientX-r.left}px`;p.style.top=`${e.clientY-r.top}px`;p.style.width=p.style.height='38px';btn.append(p);setTimeout(()=>p.remove(),680)});
 document.addEventListener('keydown',e=>{const chat=document.getElementById('chat');if(e.key==='/'&&chat?.classList.contains('active')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();document.getElementById('input')?.focus()}if(e.key==='Escape'&&chat?.classList.contains('active')&&document.activeElement===document.getElementById('input'))document.getElementById('input').blur()});
})();


/* Voice features: built-in browser speech APIs, no API key required. */
const micButton=document.getElementById('micButton');
const soundButton=document.getElementById('soundButton');
const voiceStatus=document.getElementById('voiceStatus');
const SpeechRecognitionAPI=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;
let listening=false;
let soundEnabled=true;
function voiceMessage(message){voiceStatus.textContent=message;voiceStatus.hidden=!message;}
function setListening(active){listening=active;micButton.classList.toggle('is-listening',active);micButton.setAttribute('aria-pressed',String(active));micButton.title=active?'録音を停止':'音声で質問';micButton.setAttribute('aria-label',micButton.title);micButton.textContent=active?'⏹':'🎙️';}
function speakAnswer(text){
 if(!soundEnabled||!('speechSynthesis' in window))return;
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text.replace(/[🎉🍜🎮🎤🗺️🕒😊]/gu,''));
 utterance.lang='ja-JP';utterance.rate=1;utterance.pitch=1;
 const japaneseVoice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ja'));
 if(japaneseVoice)utterance.voice=japaneseVoice;
 window.speechSynthesis.speak(utterance);
}
if(!SpeechRecognitionAPI){
 micButton.title='このブラウザーは音声入力に対応していません';
 micButton.setAttribute('aria-label',micButton.title);
 micButton.disabled=true;
}else{
 micButton.addEventListener('click',()=>{
  if(listening){recognition?.stop();return;}
  window.speechSynthesis?.cancel();
  recognition=new SpeechRecognitionAPI();
  recognition.lang='ja-JP';recognition.interimResults=false;recognition.maxAlternatives=1;recognition.continuous=false;
  recognition.onstart=()=>{setListening(true);voiceMessage('🎙️ 聞いています… 質問を話してください。');};
  recognition.onresult=e=>{const transcript=e.results[0][0].transcript.trim();if(transcript){input.value='';voiceMessage('');ask(transcript);}};
  recognition.onerror=e=>{const messages={ 'not-allowed':'マイクの使用をブラウザーで許可してください。','audio-capture':'マイクが見つかりません。','no-speech':'音声が聞き取れませんでした。もう一度お試しください。','network':'音声認識のネットワークエラーです。'};voiceMessage(messages[e.error]||'音声入力に失敗しました。');};
  recognition.onend=()=>{setListening(false);if(voiceStatus.textContent.startsWith('🎙️'))voiceMessage('');};
  try{recognition.start();}catch(e){setListening(false);voiceMessage('音声入力を開始できませんでした。');}
 });
}
if(!('speechSynthesis' in window)){
 soundEnabled=false;soundButton.disabled=true;soundButton.textContent='🔇';soundButton.title='このブラウザーは音声回答に対応していません';
 soundButton.setAttribute('aria-label',soundButton.title);soundButton.setAttribute('aria-pressed','false');
}else{
 soundButton.addEventListener('click',()=>{
  soundEnabled=!soundEnabled;
  if(!soundEnabled)window.speechSynthesis.cancel();
  soundButton.textContent=soundEnabled?'🔊':'🔇';
  soundButton.title=soundEnabled?'音声回答オン':'音声回答オフ';
  soundButton.setAttribute('aria-label',soundEnabled?'音声回答をオフにする':'音声回答をオンにする');
  soundButton.setAttribute('aria-pressed',String(soundEnabled));
 });
}
document.getElementById('backButton').addEventListener('click',()=>{recognition?.stop();window.speechSynthesis?.cancel();voiceMessage('');});

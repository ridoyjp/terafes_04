
const infoList=document.getElementById('infoList');const infoToggle=document.getElementById('infoToggle');function setInfo(open){infoList.hidden=!open;infoToggle.setAttribute('aria-expanded',String(open));}infoToggle.addEventListener('click',()=>setInfo(infoList.hidden));document.getElementById('infoClose').addEventListener('click',()=>setInfo(false));document.querySelectorAll('#infoList [data-q]').forEach(b=>b.addEventListener('click',()=>setInfo(false)));
document.getElementById('introLogo').src=document.querySelector('.head img').src;
document.getElementById('backButton').addEventListener('click',()=>{document.getElementById('chat').classList.remove('active');document.getElementById('intro').hidden=false;document.getElementById('startButton').focus();});
document.getElementById('startButton').addEventListener('click',()=>{document.getElementById('intro').hidden=true;document.getElementById('chat').classList.add('active');document.getElementById('input').focus();});
const BOT_ICON='assets/robot-logo.png';const messages=document.getElementById('messages'),input=document.getElementById('input');function add(t,user){const row=document.createElement('div');row.className='row'+(user?' user':'');const av=document.createElement('span');av.className='avatar';if(user){av.textContent='👤';}else{av.classList.add('bot-icon');const img=document.createElement('img');img.src=BOT_ICON;img.alt='Chatbot';av.appendChild(img);}const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=t;row.append(av,bubble);messages.append(row);messages.scrollTop=messages.scrollHeight}function answer(q){const s=q.toLowerCase();if(/食|food|飲|屋台|グルメ|たべ/.test(s))return '🍜 食べ物コーナーでは屋台グルメやドリンクを楽しめます。詳しい出店場所・メニューは当日の案内をご確認ください。';if(/ゲーム|game|遊|体験/.test(s))return '🎮 ゲームや体験型ブースを楽しめます！詳細は会場の案内をご確認ください。';if(/ステージ|stage|音楽|ライブ|発表/.test(s))return '🎤 ステージイベントや発表については公式スケジュールをご確認ください。';if(/場所|どこ|地図|map|トイレ|休憩|guide/.test(s))return '🗺️ 会場の案内掲示をご確認ください。スタッフにもお尋ねください！';if(/時間|いつ|日程|開催/.test(s))return '🕒 開催日時は学校からの公式案内をご確認ください。';if(/おすすめ|recommend/.test(s))return '🎉 屋台グルメ🍜、ゲーム体験🎮、ステージ🎤がおすすめです！どれが気になりますか？';if(/こんにちは|hello|hi/.test(s))return 'こんにちは！😊 学園祭について何を知りたいですか？';return '🎉「食べ物」「ゲーム」「ステージ」「場所」「おすすめ」などについて質問してください！'}function ask(q){q=q.trim();if(!q)return;add(q,true);(()=>{const typing=document.createElement('div');typing.className='row bot-typing';typing.setAttribute('aria-label','返信を入力中');typing.innerHTML='<span class="avatar bot-icon"><img src="assets/robot-logo.png" alt="Chatbot"></span><div class="bubble"><span class="typing-indicator"><span></span><span></span><span></span></span></div>';messages.append(typing);messages.scrollTop=messages.scrollHeight;setTimeout(()=>{typing.remove();add(answer(q),false)},Math.min(1050,450+q.length*22))})()}document.getElementById('form').addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value=''});document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.q)));


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

/* TTC project and school information shown INSIDE the existing chat history.
   This module does not modify the chat form, API requests, voice or festival logic. */
(() => {
  'use strict';
  const messages = document.getElementById('messages');
  if (!messages) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const members = [
    { name:'Ridoy', initials:'R', photo:'assets/ridoy-profile.png', role:'UI Design / AI API Integration', description:'チャットボット画面のデザインとAI API接続を担当。' },
    { name:'Islam', initials:'I', role:'Festival Information（担当確認中）', description:'学園祭情報の整理・フロア案内データの作成（仮案）。' },
    { name:'Emeisha', initials:'E', role:'Multilingual Support（担当確認中）', description:'多言語表現の確認・案内文の作成（仮案）。' },
    { name:'Nimu Sara', initials:'NS', role:'Testing & Quality（担当確認中）', description:'動作テスト・使いやすさの確認（仮案）。' }
  ];
  const features = [
    ['🤖 AIチャット','学校・学園祭、学習・翻訳・プログラミングなどの質問に回答します。'],
    ['🌐 多言語対応','日本語・英語・ベンガル語などで質問できます。'],
    ['🎙️ 音声機能','対応環境で音声入力・読み上げを利用できます。'],
    ['🗺️ フロアガイド','提供された学園祭フロアガイドから企画や場所を案内します。'],
    ['🏫 学校情報','学校概要・学科・入学・就職・アクセスなどを紹介します。'],
    ['🔄 AI切り替え','AIサービスに障害がある場合は別のサービスを順に試します。']
  ];
  const actions = `<div class="ttc-chat-actions"><button type="button" data-ttc-chat="about">✨ アプリ紹介</button><button type="button" data-ttc-chat="school">🏫 学校情報</button><button type="button" data-ttc-chat="team">👥 開発チーム</button></div>`;
  const team = () => `<h3>👥 Tera Fes Young Group</h3><p>4名で協力して企画・制作・改善に取り組んだチームプロジェクトです。</p><div class="ttc-team-grid">${members.map(m => `<article class="ttc-card"><div class="ttc-avatar">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}のプロフィール写真" loading="lazy">` : esc(m.initials)}</div><h4>${esc(m.name)}</h4><span class="ttc-badge">${esc(m.role)}</span><p>${esc(m.description)}</p></article>`).join('')}</div>`;
  const about = () => `<h2>✨ このアプリについて</h2><p><strong>TTC 学園祭 2026 多言語AIチャットボット</strong>は、来場者や学生が学校・学園祭の情報を気軽に調べられるように制作したWebアプリです。</p><h3>🎯 開発目的</h3><p>学園祭の会場案内や学校情報を分かりやすく提供し、外国人来場者も使いやすい案内を目指しています。</p><h3>✨ 主な機能</h3><div class="ttc-info-grid">${features.map(([name,description])=>`<article class="ttc-card"><h4>${esc(name)}</h4><p>${esc(description)}</p></article>`).join('')}</div><h3>⚙️ 仕組み</h3><p>登録された学校・学園祭の情報を参照し、必要に応じてAI APIに問い合わせます。利用できない場合は別のAIサービスを順番に試します。</p>${team()}`;
  const school = () => {
    const facts = Array.isArray(window.TTC_SCHOOL_GUIDE) ? window.TTC_SCHOOL_GUIDE : [];
    return `<h2>🏫 学校について</h2><p>東京テクニカルカレッジについて、歴史や学科、学校生活などを分かりやすくご案内します。知りたい項目を選んで、ぜひご覧ください。</p><div class="ttc-school-grid">${facts.map((f,i)=>`<button type="button" class="ttc-card" data-ttc-fact="${i}">${esc(f.topic)} →</button>`).join('')}</div>${facts.length?'':'<p>学校データを読み込めませんでした。</p>'}`;
  };
  function appendCard(html) {
    const row = document.createElement('div'); row.className = 'row ttc-chat-row';
    const avatar = document.createElement('span'); avatar.className='avatar bot-icon';
    const img=document.createElement('img');img.src='assets/robot-logo.png';img.alt='Chatbot';avatar.append(img);
    const bubble = document.createElement('div'); bubble.className='bubble ttc-chat-bubble'; bubble.innerHTML=html;
    row.append(avatar,bubble);
    messages.append(row);
    // Read the visible answer with the SAME browser voice used for ordinary
    // AI replies. Interactive choices are not part of the spoken answer.
    // Schedule after the card's detail text is populated by click handlers.
    requestAnimationFrame(() => {
      if (!row.isConnected || typeof speakAnswer !== 'function') return;
      const spoken = bubble.cloneNode(true);
      spoken.querySelectorAll('button, a, .ttc-chat-actions, .ttc-school-grid, .ttc-team-grid, .ttc-info-grid, .ttc-fact-source').forEach(node => node.remove());
      const answer = (spoken.innerText || spoken.textContent || '').trim();
      if (answer) speakAnswer(answer, 'ja-JP');
    });
    // Smoothly move only the chat history, as if the user scrolled with a mouse.
    // Keep the new reply's heading visible below the chat viewport's top edge.
    // Add temporary bottom room when the newest reply is shorter than the viewport.
    const focusNewReply = () => {
      if (!row.isConnected) return;
      const viewportHeight = messages.clientHeight;
      if (!viewportHeight) return;
      const replyHeight = row.getBoundingClientRect().height;
      const bottomRoom = Math.max(16, viewportHeight - Math.min(replyHeight, viewportHeight) + 16);
      messages.style.paddingBottom = `${bottomRoom}px`;
      const viewport = messages.getBoundingClientRect();
      const reply = row.getBoundingClientRect();
      const target = messages.scrollTop + reply.top - viewport.top - 12;
      const maxScroll = Math.max(0, messages.scrollHeight - viewportHeight);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      messages.scrollTo({
        top: Math.max(0, Math.min(target, maxScroll)),
        behavior: reduceMotion ? 'instant' : 'smooth'
      });
    };
    // Wait for the message to enter layout, then animate once (not twice).
    // Repeated scroll assignments previously interrupted the smooth animation.
    requestAnimationFrame(() => requestAnimationFrame(focusNewReply));
    return bubble;
  }
  function userChoice(label) {
    if (typeof add === 'function') add(label, true);
  }
  function show(which) {
    if(which==='about') appendCard(about()+actions);
    else if(which==='team') appendCard(`<h2>👥 開発チーム</h2>${team()}${actions}`);
    else if(which==='school') appendCard(school()+actions);
  }
  // Festival categories use the same chat-card interaction as About / School.
  // Data is read from the existing school-provided floor guide and the
  // existing categorization; the original chat/API/voice code is untouched.
  const festivalNames = {
    food:'🍜 フード', games:'🎮 ゲーム・体験', ai:'🤖 AI・展示',
    floors:'🗺️ 会場案内', all:'📚 すべての企画'
  };
  const festivalActivities = () => Array.isArray(window.TTC_FESTIVAL_ACTIVITIES) ? window.TTC_FESTIVAL_ACTIVITIES : [];
  const floorGuide = () => window.TTC_FLOOR_GUIDE || window.TTC_FESTIVAL_GUIDE || null;
  // Visitor-friendly Japanese: faithfully rephrase only the supplied floor-guide facts.
  // Do not turn possible activities into guaranteed experiences or prizes.
  const politeDescription = value => String(value || '').split('\n').map(x => x.trim().replace(/^[・●\-\s]+/, '')).filter(Boolean).map(x => {
    if (/^[（(].*[）)]$/.test(x)) return x;
    return x.replace(/[！!。\s]+$/g, '');
  });
  const floorIntro = floor => ({
    '11F':'11階では、AIやデータに関する展示・体験をご案内しています。',
    '10F':'10階では、建築の楽しさにふれられる企画をご紹介しています。',
    '9F':'9階では、ものづくりや作品づくりを楽しめる企画をご紹介しています。',
    '7F':'7階の企画をご紹介します。気になるものを探してみてください。',
    '6F':'6階の企画をご紹介します。ぜひ内容をご覧ください。',
    '5F':'5階では、学生が制作した作品やゲームなどをご紹介しています。',
    '4F':'4階では、クイズやものづくりに関する企画をご紹介しています。',
    '1F':'1階には、テラカフェのコーヒーコーナーや世界のお菓子コーナーなどがあります。',
    'B1F':'地下1階のテラホールでは、建築系学科の成果展示をご覧いただけます。'
  })[floor] || `${floor}の企画をご紹介します。`;
  const describeEntry = (e, name) => {
    const lines = [`📍 ${e.floor}${e.room ? '・'+String(e.room).trim().replace(/\s+/g,'・')+'号室' : ''}`];
    if (e.department) lines.push(`担当：${String(e.department).replace(/\n/g,'・')}`);
    const details = politeDescription(e.description);
    if (details.length) lines.push('こちらでは、'+details.join('、')+'をご紹介しています。');
    if (e.floor==='5F' && String(e.room).trim()==='501') {
      lines.pop();
      lines.push('情報処理科の1年生が制作したホームページや、2年生による生成AIを使ったアプリをご覧いただけます。生成AIによる目押しゲームもあり、ゲームに挑戦してお菓子をゲットできる企画です。ぜひ気軽にお立ち寄りください！');
    } else if (e.floor==='1F' && /コーヒー|お菓子/.test(e.description)) {
      lines.push('ちょっとひと休みしたいときにも、ぜひ立ち寄ってみてくださいね。');
    } else if (/体験|ゲーム|クイズ|作り|制作/.test(e.description)) {
      lines.push('興味のある方は、ぜひ会場で楽しんでみてください！');
    } else {
      lines.push('気になる方は、ぜひ会場でご覧ください。');
    }
    if (e.schedule) lines.push(`資料記載の日時：${e.schedule}`);
    return lines.join('\n\n');
  };
  const outdoorFood = () => `<h2>🌏 屋外フードエリア</h2><p>学校の外には、12店舗のフードブースがあります。日本の揚げ物や唐揚げなどの料理に加え、バングラデシュ、ミャンマー、ネパール、ベトナム、中国など、さまざまな国の味を楽しめます。</p><p>気になるお店を見つけたら、ぜひ立ち寄ってみてください。食べ比べを楽しむのもおすすめです！</p>`;
  const festivalButton = (label, attribute, value) => `<button type="button" class="ttc-card ttc-festival-choice" ${attribute}="${esc(value)}">${esc(label)} →</button>`;
  function showFestival(kind) {
    const activities=festivalActivities();
    const guide=floorGuide();
    if(!festivalNames[kind]) return;
    if(!guide || !activities.length) {
      appendCard(`<h2>${festivalNames[kind]}</h2><p>フロアガイドのデータを読み込めませんでした。</p>`);
      return;
    }
    if(kind==='food') {
      appendCard(`<h2>🍜 フードのご案内</h2><p>学園祭では、ひと休みできるコーナーや、いろいろな国の食べ物に出会えるエリアがあります。気になる場所を選んでみてください！</p><div class="ttc-school-grid">${festivalButton('☕ 1階・テラカフェと世界のお菓子','data-ttc-floor','1F')}${festivalButton('🌏 屋外フードエリア（12店舗）','data-ttc-outdoor','food')}</div>`);
      return;
    }
    if(kind==='floors') {
      appendCard(`<h2>🗺️ 会場案内</h2><p>地下1階から11階まで、学校の資料に掲載された企画をご案内します。気になる階を選んで、ぜひ見どころを探してみてください！</p><div class="ttc-school-grid">${guide.floors.map(f=>festivalButton('🏢 '+f,'data-ttc-floor',f)).join('')}</div>`);
      return;
    }
    const selected=activities.map((a,i)=>({...a,index:i})).filter(a => kind==='all' || (kind==='food'&&a.categories.includes('food')) || (kind==='games'&&(a.categories.includes('games')||a.categories.includes('craft'))) || (kind==='ai'&&(a.categories.includes('ai')||a.categories.includes('show'))));
    appendCard(`<h2>${festivalNames[kind]}</h2><p>学校のフロアガイドに掲載された企画をご紹介します。気になる企画を選んで、場所や内容をチェックしてみてください！</p><div class="ttc-school-grid">${selected.map(a=>festivalButton(a.entry.floor+' '+a.name,'data-ttc-activity',a.index)).join('')}</div>`);
  }
  function showAllCategories() {
    appendCard('<h2>📋 情報一覧</h2><p>学園祭の見どころをご案内します。気になるカテゴリーを選んで、ぜひチェックしてみてください！</p><div class="ttc-school-grid">' + Object.entries(festivalNames).map(([key,label]) => festivalButton(label, 'data-ttc-festival', key)).join('') + '</div>');
  }
  // Capture-phase interception prevents the legacy popup/menu listener from
  // opening when a quick-category button is clicked.
  document.addEventListener('click', e => {
    const button=e.target.closest('[data-quick-nav], [data-festival-nav], #infoToggle');
    if(!button) return;
    e.preventDefault();e.stopImmediatePropagation();
    if (button.id === 'infoToggle') {
      const menu=document.getElementById('infoList');
      if (menu) menu.hidden=true;
      button.setAttribute('aria-expanded','false');
      userChoice('📋 情報一覧');
      showAllCategories();
      return;
    }
    const kind=button.dataset.quickNav || button.dataset.festivalNav;
    userChoice(festivalNames[kind] || button.textContent.trim());
    showFestival(kind);
    const menu=document.getElementById('infoList');
    if(menu && !menu.hidden) {
      const closer=document.getElementById('infoClose');
      if(closer) closer.click();
    }
  },true);
  document.addEventListener('click', e => {
    const outdoor=e.target.closest('[data-ttc-outdoor]');
    if(outdoor && messages.contains(outdoor)) { e.preventDefault(); userChoice('🌏 屋外フードエリア'); appendCard(outdoorFood()); return; }
    const category=e.target.closest('[data-ttc-festival]');
    if(category) { e.preventDefault();userChoice(festivalNames[category.dataset.ttcFestival] || category.textContent.trim());showFestival(category.dataset.ttcFestival);return; }
    const activity=e.target.closest('[data-ttc-activity]');
    if(activity && messages.contains(activity)) {
      const a=festivalActivities()[Number(activity.dataset.ttcActivity)];
      if(a) {e.preventDefault();userChoice(a.name);const bubble=appendCard(`<h2>${esc(a.name)}</h2><div class="ttc-fact-text"></div>`);bubble.querySelector('.ttc-fact-text').textContent=describeEntry(a.entry,a.name);}
      return;
    }
    const floor=e.target.closest('[data-ttc-floor]');
    if(floor && messages.contains(floor)) {
      e.preventDefault();const guide=floorGuide();const name=floor.dataset.ttcFloor;userChoice('🏢 '+name);
      const entries=(guide?.entries||[]).filter(x=>x.floor===name);
      appendCard(`<h2>🏢 ${esc(name)}</h2><p>${esc(floorIntro(name))}気になる企画を選ぶと、詳しい内容をご覧いただけます。</p><div class="ttc-school-grid">${entries.map((x,i)=>festivalButton((x.room?String(x.room).trim().replace(/\s+/g,'・')+'号室 ':'')+String(x.description).split('\n')[0],'data-ttc-floor-entry',`${name}:${i}`)).join('')}</div>`);
      return;
    }
    const entryButton=e.target.closest('[data-ttc-floor-entry]');
    if(entryButton && messages.contains(entryButton)) {
      e.preventDefault();const [name,index]=entryButton.dataset.ttcFloorEntry.split(':');
      const entry=(floorGuide()?.entries||[]).filter(x=>x.floor===name)[Number(index)];
      if(entry) {userChoice(entryButton.textContent.trim());const bubble=appendCard(`<h2>🏢 ${esc(name)}</h2><div class="ttc-fact-text"></div>`);bubble.querySelector('.ttc-fact-text').textContent=describeEntry(entry);}
      return;
    }
    const button = e.target.closest('[data-ttc-chat]');
    if(button) { e.preventDefault();userChoice(button.textContent.trim());show(button.dataset.ttcChat);return; }
    const factButton=e.target.closest('[data-ttc-fact]');
    if(factButton && messages.contains(factButton)) {
      e.preventDefault();
      const facts=Array.isArray(window.TTC_SCHOOL_GUIDE)?window.TTC_SCHOOL_GUIDE:[];
      const fact=facts[Number(factButton.dataset.ttcFact)]; if(!fact)return;userChoice(fact.topic);
      const bubble=appendCard(`<h2>${esc(fact.topic)}</h2><div class="ttc-fact-text"></div><div class="ttc-fact-source"></div>${actions}`);
      bubble.querySelector('.ttc-fact-text').textContent=String(fact.text||'');
      const source=bubble.querySelector('.ttc-fact-source');
      const url=String(fact.source||'').split(/[ ;]+/).find(s=>/^https:\/\//.test(s));
      if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='参照元・公式ページを開く ↗';source.append(link);}
      else source.textContent='最新情報は学校公式サイトでご確認ください。';
    }
  });
})();

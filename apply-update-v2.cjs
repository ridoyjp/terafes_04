// 学園祭 AI v2: safe, repeatable patch. Run inside your own Git clone.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const scriptPath = path.join(root, 'script.js');
const htmlPath = path.join(root, 'index.html');
const workerPath = path.join(root, 'cloudflare-worker', 'src', 'index.js');
const sourceLogo = path.join(__dirname, 'update-files', 'robot-logo.png');
const logoPath = path.join(root, 'assets', 'robot-logo.png');
for (const f of [scriptPath, htmlPath, workerPath, logoPath, sourceLogo]) assert(fs.existsSync(f), `Missing ${f}. Open CMD in C:\\terafes_04_fresh first.`);
const originalJs = fs.readFileSync(scriptPath, 'utf8');
const originalHtml = fs.readFileSync(htmlPath, 'utf8');
const originalWorker = fs.readFileSync(workerPath, 'utf8');
const eol = value => value.includes('\r\n') ? '\r\n' : '\n';
let js = originalJs.replace(/\r\n/g, '\n');
let html = originalHtml.replace(/\r\n/g, '\n');
let worker = originalWorker.replace(/\r\n/g, '\n');
const changes=[];
function replaceOnce(which, old, newer, tag) {
  const value = which==='js'?js:which==='html'?html:worker;
  if(value.includes(newer)) return;
  assert(value.includes(old), `Version mismatch at ${tag}. No files were changed. Please send your script.js / Worker version.`);
  const changed=value.replace(old,newer);
  if(which==='js') js=changed; else if(which==='html') html=changed; else worker=changed;
  changes.push(tag);
}
// Include the prior v1 busy/speech fix, so v2 works even if v1 was never applied.
if (!js.includes('messages.setAttribute("aria-busy", "true")')) replaceOnce('js',
  '  pendingChat = true;\n  // For typed input, Gemini follows the actual message language.',
  '  pendingChat = true;\n  messages.setAttribute("aria-busy", "true");\n  const sendButton = document.querySelector(\'#form button[type="submit"]\');\n  if (sendButton) sendButton.disabled = true;\n  // For typed input, Gemini follows the actual message language.', 'busy guard');
replaceOnce('js',
  '    speakAnswer(result.text, lastQuestionLanguage);\n  }\n\n  pendingChat = false;\n}',
  '    try {\n      speakAnswer(result.text, lastQuestionLanguage);\n    } catch (error) {\n      console.warn("Speech output unavailable", error);\n      voiceMessage("🔇 音声を再生できませんでした。文字の回答をご確認ください。");\n    }\n  }\n\n  pendingChat = false;\n  messages.removeAttribute("aria-busy");\n  if (sendButton) sendButton.disabled = false;\n}', 'speech exception guard');
// Cancel pending chat and microphone/recognition when the visitor goes back.
replaceOnce('js', 'let pendingChat = false;',
`let pendingChat = false;
let chatSession = 0;
let activeChatController = null;`, 'chat session');
replaceOnce('js',
  'function closeChat() {\n  japaneseOnlyListening = false;',
`function closeChat() {
  chatSession++;
  activeChatController?.abort();
  activeChatController = null;
  pendingChat = false;
  messages.removeAttribute("aria-busy");
  const sendButton = document.querySelector('#form button[type="submit"]');
  if (sendButton) sendButton.disabled = false;
  japaneseVoiceSession++;
  japaneseOnlyListening = false;`, 'back button cleanup');
replaceOnce('js',
  '  const controller = new AbortController();\n  const chatStartedAt = performance.now();',
  '  const controller = new AbortController();\n  activeChatController = controller;\n  const chatStartedAt = performance.now();', 'active chat abort controller');
replaceOnce('js',
  '  } finally {\n    clearTimeout(timeout);\n  }\n}\n\nfunction explainAIError',
  '  } finally {\n    clearTimeout(timeout);\n    if (activeChatController === controller) activeChatController = null;\n  }\n}\n\nfunction explainAIError', 'chat controller cleanup');
replaceOnce('js',
  '  pendingChat = true;\n  messages.setAttribute("aria-busy", "true");',
  '  pendingChat = true;\n  const session = ++chatSession;\n  messages.setAttribute("aria-busy", "true");', 'request generation');
replaceOnce('js',
  '  } finally {\n    typing.remove();\n  }\n\n  add(result.text, false);',
`  } finally {
    typing.remove();
  }

  // Ignore an old response after Back, even if the network completed late.
  if (session !== chatSession || !document.getElementById("chat").classList.contains("active")) return;
  add(result.text, false);`, 'ignore stale chat reply');
// Keep recording from starting if permission resolves after navigation.
replaceOnce('js', 'let recordingBusy = false;', 'let recordingBusy = false;\nlet recordingSession = 0;', 'recording session');
replaceOnce('js',
  'function cancelRecording() {\n  autoSendRecording = false;',
  'function cancelRecording() {\n  recordingSession++;\n  autoSendRecording = false;', 'invalidate recording on Back');
replaceOnce('js',
  'async function processRecording(blob) {\n  if (!blob.size)',
  'async function processRecording(blob, session = recordingSession) {\n  if (session !== recordingSession) return;\n  if (!blob.size)', 'recording transcription session');
replaceOnce('js',
  '    if (japaneseFastSucceeded) return;\n    if (!transcript) throw new Error',
  '    if (session !== recordingSession || japaneseFastSucceeded) return;\n    if (!transcript) throw new Error', 'ignore stale transcription');
replaceOnce('js',
  '  } catch (err) {\n    console.warn("Multilingual transcription failed", err?.message);',
  '  } catch (err) {\n    if (session !== recordingSession) return;\n    console.warn("Multilingual transcription failed", err?.message);', 'suppress stale voice errors');
replaceOnce('js',
  '    recordingBusy = false;\n    if (micButton) micButton.disabled = false;\n  }\n}\nfunction stopRecording',
  '    if (session === recordingSession) {\n      recordingBusy = false;\n      if (micButton) micButton.disabled = false;\n    }\n  }\n}\nfunction stopRecording', 'recording cleanup');
replaceOnce('js',
  '  recordingBusy = true;\n  try {\n    window.speechSynthesis?.cancel();',
  '  recordingBusy = true;\n  const session = ++recordingSession;\n  try {\n    window.speechSynthesis?.cancel();', 'capture recording session');
replaceOnce('js',
  '    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });\n    if (japaneseFastSucceeded)',
`    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    if (session !== recordingSession || !document.getElementById("chat").classList.contains("active")) {
      stream.getTracks().forEach(track => track.stop());
      if (session === recordingSession) recordingBusy = false;
      return;
    }
    recordingStream = stream;
    if (japaneseFastSucceeded)`, 'late mic permission cleanup');
replaceOnce('js',
  '    recorder.onstop = () => {\n      const audioBlob = new Blob(recordingChunks, { type: recorder.mimeType || mimeType || "audio/webm" });',
  '    recorder.onstop = () => {\n      if (session !== recordingSession) return;\n      const audioBlob = new Blob(recordingChunks, { type: recorder.mimeType || mimeType || "audio/webm" });', 'recording onstop guard');
if (js.includes('void processRecording(audioBlob);')) {
  js = js.replaceAll('void processRecording(audioBlob);', 'void processRecording(audioBlob, session);');
  changes.push('voice process session');
}
replaceOnce('js',
  '  } catch (err) {\n    stopMicrophoneTracks(); recordingBusy = false;\n    voiceMessage(err?.name === "NotAllowedError" ?',
  '  } catch (err) {\n    if (session !== recordingSession) return;\n    stopMicrophoneTracks(); recordingBusy = false;\n    voiceMessage(err?.name === "NotAllowedError" ?', 'ignore late mic errors');
// iOS may produce an empty/oversized clip; always release the mic busy lock.
replaceOnce('js',
  '  if (!blob.size) { voiceMessage("⚠️ 音声が録音されませんでした。もう一度お試しください。"); return; }',
  '  if (!blob.size) { recordingBusy = false; voiceMessage("⚠️ 音声が録音されませんでした。もう一度お試しください。"); return; }', 'empty recording cleanup');
replaceOnce('js',
  '  if (blob.size > MAX_AUDIO_BYTES) { voiceMessage("⚠️ 音声が長すぎます。短くお話しください。"); return; }',
  '  if (blob.size > MAX_AUDIO_BYTES) { recordingBusy = false; voiceMessage("⚠️ 音声が長すぎます。短くお話しください。"); return; }', 'oversized recording cleanup');
replaceOnce('js',
  '    nativeDictation("⚠️ AI音声認識のURLがありません。キーボードのマイクを使用してください。"); return;',
  '    recordingBusy = false; nativeDictation("⚠️ AI音声認識のURLがありません。キーボードのマイクを使用してください。"); return;', 'missing transcription URL cleanup');
replaceOnce('js',
  '  if (japaneseFastSucceeded) return;\n  voiceMessage("🎙️ 日本語の音声を文字に変換しています…");'.replace('\\n','\n'),
  '  if (japaneseFastSucceeded) { recordingBusy = false; return; }\n  voiceMessage("🎙️ 日本語の音声を文字に変換しています…");'.replace('\\n','\n'), 'fast recognition cleanup');
// Localized failure feedback when Gemini is unavailable (no need to call another AI).
replaceOnce('js',
  'function explainAIError(error) {\n  if (location.protocol === "file:")'.replace('\\n','\n'),
`function explainAIError(error, languageHint = "ja-JP") {
  if (languageHint && languageHint !== "ja-JP") {
    const offlineMessages = {
      "bn-BD": "⚠️ এই মুহূর্তে AI সেবার সঙ্গে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
      "en-US": "⚠️ The AI service is unavailable right now. Check your connection and try again.",
      "hi-IN": "⚠️ AI सेवा अभी उपलब्ध नहीं है। इंटरनेट कनेक्शन जाँचें और दोबारा प्रयास करें।",
      "es-ES": "⚠️ El servicio de IA no está disponible. Comprueba tu conexión e inténtalo de nuevo.",
      "fr-FR": "⚠️ Le service d'IA est indisponible. Vérifiez votre connexion et réessayez.",
      "ko-KR": "⚠️ AI 서비스에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.",
      "zh-CN": "⚠️ 暂时无法连接 AI 服务。请检查网络连接后重试。"
    };
    return offlineMessages[languageHint] || offlineMessages["en-US"];
  }
  if (location.protocol === "file:")`, 'localized chat error');
replaceOnce('js',
  'result = { text: explainAIError(error), fallback: true };',
  'result = { text: explainAIError(error, languageHint), fallback: true };', 'localized error call');
// Bound /chat JSON size even without Content-Length.
replaceOnce('worker',
  '    try {\n      data = await request.json();\n    } catch {\n      return json({ error: "Invalid JSON" }, 400, headers);\n    }',
`    try {
      const body = await request.text();
      if (body.length > 14000) return json({ error: "Request too large" }, 413, headers);
      data = JSON.parse(body);
    } catch {
      return json({ error: "Invalid JSON" }, 400, headers);
    }`, 'bounded chat JSON');
// Short sidebar topics are also 2026 festival queries, not generic AI questions.
replaceOnce('worker',
  '    const isFestivalQuickTopic = /^(おすすめは何ですか|食べ物はどこですか|ゲームはありますか|ステージについて教えて|会場の場所を教えて|開催時間を教えて|トイレはどこですか)/.test(message);',
  '    const isFestivalQuickTopic = /^(?:おすすめ|食べ物|フード|ゲーム|ステージ|会場|場所|時間|トイレ)[!?！？。]?$/.test(message) || /^(おすすめは何ですか|食べ物はどこですか|ゲームはありますか|ステージについて教えて|会場の場所を教えて|開催時間を教えて|トイレはどこですか)/.test(message);', 'sidebar topics respect approval');
// Asking about 2025 AND 2026 must not bypass the 2026 approval guard.
replaceOnce('worker',
  '    const refersTo2025 = /2025|昨年|去年|last year|previous year|গত বছর/i.test(message);',
  '    const refersTo2025 = /2025|昨年|去年|last year|previous year|গত বছর/i.test(message) && !/2026|今年|this year|এ বছর/i.test(message);', 'mixed-year approval guard');
// Provide deterministic festival-unverified replies in the visitor's selected language.
const oldReplies=`      const reply = lang === "bn-BD"
        ? "২০২৬ সালের TTC 学園祭-এর নির্দিষ্ট সময়, খাবারের স্টল, দাম ও কক্ষের তথ্য এখনও স্কুল থেকে অনুমোদিত নয়। অনুগ্রহ করে স্কুলের অফিসিয়াল ঘোষণা বা আয়োজক শিক্ষকের সঙ্গে নিশ্চিত করুন।"
        : lang === "en-US"
          ? "The 2026 TTC Festival schedule, food stalls, prices and room details have not yet been confirmed by the school. Please check the school's official announcements or festival staff."
          : "2026年の学園祭の開催日時、出店、価格、教室などの詳細は、現在学校から確認が取れていません。学校の公式案内または担当の先生にご確認ください。";`;
const newReplies=`      const unverifiedReplies = {
        "ja-JP": "2026年の学園祭の開催日時、出店、価格、教室などの詳細は、現在学校から確認が取れていません。学校の公式案内または担当の先生にご確認ください。",
        "bn-BD": "২০২৬ সালের TTC উৎসবের সময়সূচি, স্টল, দাম ও কক্ষের তথ্য এখনও স্কুল থেকে নিশ্চিত করা হয়নি। স্কুলের অফিসিয়াল ঘোষণা বা আয়োজকদের কাছে যাচাই করুন।",
        "en-US": "The 2026 TTC Festival schedule, stalls, prices and room details have not yet been confirmed by the school. Please check the official announcements or festival staff.",
        "hi-IN": "2026 TTC उत्सव की समय-सारणी, स्टॉल, कीमतें और कमरों की जानकारी अभी स्कूल द्वारा पुष्टि नहीं की गई है। कृपया आधिकारिक सूचना या आयोजकों से जाँच करें।",
        "ur-PK": "2026 کے TTC فیسٹیول کے اوقات، اسٹالز، قیمتوں اور کمروں کی تفصیلات کی ابھی اسکول نے تصدیق نہیں کی۔ براہ کرم سرکاری اعلان یا منتظمین سے معلوم کریں۔",
        "ar-SA": "لم تؤكد المدرسة بعد مواعيد مهرجان TTC لعام 2026 أو الأكشاك أو الأسعار أو القاعات. يرجى مراجعة الإعلان الرسمي أو فريق التنظيم.",
        "es-ES": "La escuela aún no ha confirmado los horarios, puestos, precios ni aulas del festival TTC 2026. Consulta los anuncios oficiales o al personal organizador.",
        "fr-FR": "L'école n'a pas encore confirmé les horaires, les stands, les prix ni les salles du festival TTC 2026. Consultez les annonces officielles ou les organisateurs.",
        "de-DE": "Die Schule hat Zeiten, Stände, Preise und Räume des TTC-Festivals 2026 noch nicht bestätigt. Bitte prüfen Sie die offiziellen Mitteilungen oder fragen Sie das Organisationsteam.",
        "pt-BR": "A escola ainda não confirmou horários, barracas, preços nem salas do Festival TTC 2026. Consulte os comunicados oficiais ou a equipe organizadora.",
        "zh-CN": "学校尚未确认2026年TTC学园祭的时间、摊位、价格及教室信息。请查看学校官方通知或咨询活动工作人员。",
        "ko-KR": "학교에서 2026년 TTC 축제의 일정, 부스, 가격 및 강의실 정보를 아직 확인하지 않았습니다. 공식 안내나 행사 담당자에게 확인해 주세요.",
        "id-ID": "Sekolah belum mengonfirmasi jadwal, stan, harga, dan ruang Festival TTC 2026. Silakan periksa pengumuman resmi atau tanyakan kepada panitia.",
        "th-TH": "โรงเรียนยังไม่ยืนยันกำหนดการ บูธ ราคา และห้องจัดงานเทศกาล TTC ปี 2026 โปรดตรวจสอบประกาศทางการหรือสอบถามผู้จัดงาน",
        "vi-VN": "Nhà trường chưa xác nhận lịch trình, gian hàng, giá cả và phòng của lễ hội TTC 2026. Vui lòng kiểm tra thông báo chính thức hoặc hỏi ban tổ chức.",
        "si-LK": "2026 TTC උත්සවයේ වේලාවන්, කුටි, මිල ගණන් සහ කාමර තොරතුරු පාසල තවම තහවුරු කර නැත. නිල නිවේදන හෝ සංවිධායකයන්ගෙන් විමසන්න."
      };
      const reply = unverifiedReplies[lang] || unverifiedReplies["en-US"];`;
replaceOnce('worker',oldReplies,newReplies,'multilingual unverified information');
// Change asset cache tokens so iPhone Safari does not reuse old scripts after deploy.
for(const [old,newer] of [
  ['style.css?v=20261022-robot-voice-bow-v2','style.css?v=20261022-function-v2'],
  ['script.js?v=20261022-robot-voice-bow-v2','script.js?v=20261022-function-v2']
]) replaceOnce('html',old,newer,'mobile cache refresh');
// Validate before writing anything.
assert(js.includes('const BOT_ICON = "assets/robot-logo.png"'), 'Unexpected reply avatar version');
assert(html.includes('src="assets/robot-logo.png"'), 'Unexpected HTML avatar version');
assert(worker.includes('getApprovedFestivalContext'), 'Missing festival approval guard');
const restoreEol = (value,original) => eol(original)==='\r\n' ? value.replace(/\n/g,'\r\n') : value;
fs.writeFileSync(scriptPath,restoreEol(js,originalJs));
fs.writeFileSync(workerPath,restoreEol(worker,originalWorker));
fs.writeFileSync(htmlPath,restoreEol(html,originalHtml));
fs.copyFileSync(sourceLogo,logoPath);
console.log('PASS: v2 applied ('+changes.length+' targeted changes).');
console.log('Next: node tools/deep-function-check.mjs');

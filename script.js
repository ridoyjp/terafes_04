
/* ==========================================
   学園祭 Chat Bot 2026
   Gemini AI + Voice Input + Voice Output
   Frontend JavaScript
========================================== */

// ---------- INFORMATION PANEL ----------

const infoList = document.getElementById("infoList");
const infoToggle = document.getElementById("infoToggle");

function setInfo(open) {
  infoList.hidden = !open;
  infoToggle.setAttribute("aria-expanded", String(open));
}

infoToggle.addEventListener("click", () => {
  setInfo(infoList.hidden);
});

document.getElementById("infoClose").addEventListener("click", () => {
  setInfo(false);
});

document.querySelectorAll("#infoList [data-q]").forEach(button => {
  button.addEventListener("click", () => setInfo(false));
});

// ---------- PAGE NAVIGATION ----------

document.getElementById("introLogo").src =
  document.querySelector(".head img").src;

function openChat() {
  stopWelcomeSpeech();
  window.speechSynthesis?.cancel();
  document.getElementById("intro").hidden = true;
  document.getElementById("chat").classList.add("active");
  if (window.matchMedia("(min-width: 901px)").matches) {
    document.getElementById("input").focus();
  }
}

function closeChat() {
  japaneseOnlyListening = false;
  japaneseOnlyTranscript = "";
  setListening(false);
  stopFastJapaneseRecognition();
  cancelRecording();
  window.speechSynthesis?.cancel();
  voiceMessage("");

  document.getElementById("chat").classList.remove("active");
  document.getElementById("intro").hidden = false;
  document.getElementById("startButton").focus();
  // Resume continuous welcome narration when returning from chat.
  if (!welcomeMuted) playWelcomeSpeech();
}

document.getElementById("startButton")
  .addEventListener("click", openChat);

document.getElementById("backButton")
  .addEventListener("click", closeChat);

// ---------- CHAT ELEMENTS ----------

const BOT_ICON = "assets/robot-logo.png";

const messages = document.getElementById("messages");
const input = document.getElementById("input");

function add(text, user = false) {
  const row = document.createElement("div");
  row.className = "row" + (user ? " user" : "");

  const avatar = document.createElement("span");
  avatar.className = "avatar";

  if (user) {
    avatar.textContent = "👤";
  } else {
    avatar.classList.add("bot-icon");

    const image = document.createElement("img");
    image.src = BOT_ICON;
    image.alt = "Chatbot";

    avatar.appendChild(image);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.append(avatar, bubble);
  messages.appendChild(row);

  messages.scrollTop = messages.scrollHeight;
}

// ---------- LOCAL FALLBACK ANSWERS ----------

function answer(question) {
  const q = question.toLowerCase();

  if (/食|food|飲|屋台|グルメ|たべ/.test(q)) {
    return "🍜 食べ物コーナーでは屋台グルメやドリンクを楽しめます。詳しい出店場所・メニューは当日の案内をご確認ください。";
  }

  if (/ゲーム|game|遊|体験/.test(q)) {
    return "🎮 ゲームや体験型ブースを楽しめます！詳細は会場の案内をご確認ください。";
  }

  if (/ステージ|stage|音楽|ライブ|発表/.test(q)) {
    return "🎤 ステージイベントや発表については公式スケジュールをご確認ください。";
  }

  if (/場所|どこ|地図|map|トイレ|休憩|guide/.test(q)) {
    return "🗺️ 会場の案内掲示をご確認ください。スタッフにもお尋ねください！";
  }

  if (/時間|いつ|日程|開催/.test(q)) {
    return "🕒 開催日時は学校からの公式案内をご確認ください。";
  }

  if (/おすすめ|recommend/.test(q)) {
    return "🎉 屋台グルメ🍜、ゲーム体験🎮、ステージ🎤がおすすめです！どれが気になりますか？";
  }

  if (/こんにちは|hello|hi/.test(q)) {
    return "こんにちは！😊 学園祭について何を知りたいですか？";
  }

  return "申し訳ありません。現在AIに接続できません。しばらくしてからもう一度お試しください。";
}

// ---------- GEMINI CONFIGURATION ----------

// The Gemini API key must remain in Cloudflare Worker secrets.
const CHAT_API_URL =
  (window.GAKUEN_CHAT_CONFIG?.apiUrl || "").trim();

const chatHistory = [];
let lastQuestionLanguage = "";

// No visible language selector. Browser SpeechRecognition requires a recognition
// locale; use the phone/browser's preferred language, not a fictional auto-detect.
const deviceLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "ja-JP";
function requestedVoiceLanguage() {
  return deviceLanguage;
}
// Conservative Romaji detection: do not treat ordinary English as Japanese.
// Handles Japanese school questions written using Latin letters.
function isJapaneseRomaji(text) {
  const q = String(text || "").toLowerCase().trim().replace(/[?!.,]/g, " ").replace(/\s+/g, " ");
  if (!q || /[\u0080-\uffff]/.test(q)) return false;
  const japanesePhrases = /\b(?:desu|desuka|desu ka|masu|masuka|masu ka|arimasu|arimasuka|kudasai|onegaishimasu|oshiete|shiritai|dare|doko|itsu|nanji|nani|nan desu|donna|douyatte|ikikata|kouchou|kocho|fukukouchou|sensei|gakka|gakuen|gakusai|gakuensai|nyuugaku|jugyouryou|ryuugakusei|shushoku|shikaku|jyuusho|juusho|denwa|koukou|senmon|daigaku|wa dare|wa doko|wa nani|ni tsuite|no koto|tte nani|oshiete kudasai)\b/i;
  const ttcSchoolRomaji = /\b(?:ttc|tokyo technical college|tokyo tekunikaru karejji|tokyo technical|higashi nakano)\b/i.test(q);
  const japaneseGrammar = /\b(?:wa|no|ni|de|ga|wo|o)\b/i.test(q);
  return japanesePhrases.test(q) || (ttcSchoolRomaji && japaneseGrammar);
}

function detectWrittenLanguage(text) {
  if (isJapaneseRomaji(text)) return "ja-JP";
  if (/[ঀ-৿]/u.test(text)) return "bn-BD";
  if (/[぀-ヿ]/u.test(text)) return "ja-JP";
  // Japanese kanji-only input is common in this TTC application.
  // Honor kana first; for kanji-only text, default to Japanese unless explicitly Chinese.
  if (/[一-鿿]/u.test(text)) return "ja-JP";
  if (/[가-힯]/u.test(text)) return "ko-KR";
  if (/[ऀ-ॿ]/u.test(text)) return "hi-IN";
  if (/[඀-෿]/u.test(text)) return "si-LK";
  if (/[؀-ۿ]/u.test(text)) return "ar-SA";
  if (/[฀-๿]/u.test(text)) return "th-TH";
  if (/[Ѐ-ӿ]/u.test(text)) return "ru-RU";
  if (/[ก-๛]/u.test(text)) return "th-TH";
  if (/[ა-ჰ]/u.test(text)) return "ka-GE";
  if (/[Α-ω]/u.test(text)) return "el-GR";
  if (/[א-ת]/u.test(text)) return "he-IL";
  if (/[Ա-ֆ]/u.test(text)) return "hy-AM";
  // Plain Latin-script questions default to English, not the browser's Japanese UI locale.
  // Other Latin-script languages need a more capable recognizer for accurate auto-detection.
  if (/[a-zA-Z]/.test(text)) return "en-US";
  return "";
}

let pendingChat = false;

// ---------- TYPING INDICATOR ----------

function showTyping() {
  const typing = document.createElement("div");

  typing.className = "row bot-typing";
  typing.setAttribute("aria-label", "返信を入力中");

  typing.innerHTML = `
    <span class="avatar bot-icon">
      <img src="assets/robot-logo.png" alt="Chatbot">
    </span>
    <div class="bubble">
      <span class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  `;

  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  return typing;
}

// ---------- GEMINI API REQUEST ----------

async function getAIAnswer(question, languageHint = "") {
  if (!CHAT_API_URL || CHAT_API_URL.includes("YOUR-WORKER")) {
    throw new Error("AI_API_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const chatStartedAt = performance.now();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: chatHistory.slice(-12),
        responseLanguage: languageHint
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AI Worker HTTP Error", response.status, data);
      const error = new Error(String(data.error || `HTTP ${response.status}`));
      error.status = response.status;
      throw error;
    }
    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("EMPTY_AI_REPLY");
    }
    console.info("[Voice timing] chat response:", Math.round(performance.now() - chatStartedAt), "ms");
    return { text: data.reply.trim().slice(0, 5000), fallback: false };
  } finally {
    clearTimeout(timeout);
  }
}

function explainAIError(error) {
  if (location.protocol === "file:") {
    return "⚠️ AIはローカルファイル(file://)から利用できません。公式サイト https://ridoyjp.github.io/terafes_04/ を開いてください。";
  }
  if (error?.name === "AbortError") return "⚠️ AIの応答がタイムアウトしました。少し待ってからもう一度お試しください。";
  if (error?.status === 403) return "⚠️ サイトの接続元(Origin)が許可されていません。公式GitHub Pagesサイトをご利用ください。";
  if (error?.status === 429) return "⚠️ AIの利用上限に達しました。少し時間をおいてお試しください。";
  if (error?.status === 502 || error?.status === 503 || error?.status === 504) return "⚠️ AIプロバイダーとの接続で問題が発生しました。管理者はCloudflare Workerログをご確認ください。";
  if (error?.message === "AI_API_NOT_CONFIGURED") return "⚠️ AI APIのURLが設定されていません。config.jsを確認してください。";
  return "⚠️ 現在AIサービスに接続できません。通信環境を確認してもう一度お試しください。";
}

// ---------- SEND MESSAGE ----------

async function ask(question, spokenLanguage = "") {
  question = String(question || "").trim();

  if (!question || pendingChat) return;

  pendingChat = true;
  // For typed input, Gemini follows the actual message language.
  // For spoken input, use the chosen recognition locale.
  const languageHint = spokenLanguage || detectWrittenLanguage(question) || requestedVoiceLanguage();
  lastQuestionLanguage = languageHint;

  add(question, true);

  const typing = showTyping();

  let result;

  try {
    result = await getAIAnswer(question, languageHint);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    result = { text: explainAIError(error), fallback: true };
  } finally {
    typing.remove();
  }

  add(result.text, false);

  if (!result.fallback) {
    chatHistory.push(
      {
        role: "user",
        text: question.slice(0, 4000)
      },
      {
        role: "model",
        text: result.text.slice(0, 5000)
      }
    );

    if (chatHistory.length > 12) {
      chatHistory.splice(0, chatHistory.length - 12);
    }

    speakAnswer(result.text, lastQuestionLanguage);
  }

  pendingChat = false;
}

// ---------- CHAT FORM ----------

document.getElementById("form").addEventListener("submit", event => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question || pendingChat) return;

  input.value = "";
  ask(question);
});

// ---------- QUICK QUESTION BUTTONS ----------

document.querySelectorAll("[data-q]").forEach(button => {
  button.addEventListener("click", () => {
    ask(button.dataset.q);
  });
});

// ---------- VISUAL EFFECTS ----------

(() => {
  const intro = document.getElementById("intro");

  if (intro) {
    const light = document.createElement("div");
    light.className = "light-follow";
    intro.prepend(light);

    const field = document.createElement("div");
    field.className = "spark-field";
    field.setAttribute("aria-hidden", "true");

    for (let i = 0; i < 24; i++) {
      const dot = document.createElement("span");

      dot.className = "spark";

      const x = (i * 37 + 13) % 100;
      const y = (i * 23 + 9) % 100;

      dot.style.cssText = `
        --x:${x}%;
        --y:${y}%;
        --s:${2 + i % 4}px;
        --d:${4 + i % 5}s;
        --delay:${-(i * 0.37)}s
      `;

      field.appendChild(dot);
    }

    intro.prepend(field);

    intro.addEventListener("pointermove", event => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const rect = intro.getBoundingClientRect();

      intro.style.setProperty(
        "--mouse-x",
        `${event.clientX - rect.left}px`
      );

      intro.style.setProperty(
        "--mouse-y",
        `${event.clientY - rect.top}px`
      );
    });
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (
      !button ||
      document.body.classList.contains("motion-off") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const rect = button.getBoundingClientRect();

    const ripple = document.createElement("span");
    ripple.className = "ripple";

    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.style.width = "38px";
    ripple.style.height = "38px";

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 680);
  });

  document.addEventListener("keydown", event => {
    const chat = document.getElementById("chat");

    if (
      event.key === "/" &&
      chat?.classList.contains("active") &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      input.focus();
    }

    if (
      event.key === "Escape" &&
      chat?.classList.contains("active") &&
      document.activeElement === input
    ) {
      input.blur();
    }
  });
})();

// ---------- WORLDWIDE AUTOMATIC VOICE INPUT ----------
// Records a short voice clip and sends it to Cloudflare/Gemini for multilingual
// transcription. No language selector, and no assumed phone language.
// A recording is uploaded only after the visitor presses the microphone.
const micButton = document.getElementById("micButton");
const soundButton = document.getElementById("soundButton");
const voiceStatus = document.getElementById("voiceStatus");
let recognition = null;
let japaneseFastSession = 0;
let japaneseFastSucceeded = false;
let japaneseFastStartedAt = 0;
const BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// Japanese-first: enable browser STT when the device language is Japanese.
// Non-Japanese browsers keep Gemini multilingual auto-detection for accuracy.
const JAPANESE_FIRST = /^ja(?:-|$)/i.test(deviceLanguage);
function stopFastJapaneseRecognition() {
  const current = recognition;
  recognition = null;
  if (current) {
    current.onresult = null;
    current.onerror = null;
    current.onend = null;
    try { current.abort(); } catch (_) {}
  }
}
// The browser can provide Japanese text sooner than uploading a recording.
// A simultaneous short MediaRecorder clip remains a fallback when browser STT
// is unavailable, gives no text, or fails. No duplicate messages are sent.
function startFastJapaneseRecognition() {
  stopFastJapaneseRecognition();
  if (!JAPANESE_FIRST || !BrowserSpeechRecognition || pendingChat) return;
  const session = ++japaneseFastSession;
  japaneseFastStartedAt = performance.now();
  japaneseFastSucceeded = false;
  try {
    const r = new BrowserSpeechRecognition();
    recognition = r;
    r.lang = 'ja-JP';
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = event => {
      if (session !== japaneseFastSession || japaneseFastSucceeded) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (!item.isFinal) continue;
        const transcript = String(item[0]?.transcript || '').trim();
        if (!transcript || pendingChat) return;
        japaneseFastSucceeded = true;
        console.info('[Voice timing] Japanese browser STT:', Math.round(performance.now() - japaneseFastStartedAt), 'ms');
        // Stop and discard the backup clip; Gemini transcription must NOT run.
        autoSendRecording = false;
        cancelRecording();
        stopFastJapaneseRecognition();
        const question = (input.value.trim() ? input.value.trim() + ' ' : '') + transcript;
        input.value = '';
        voiceMessage('✅ 日本語を認識しました。質問を送信しています…');
        if (document.getElementById('chat').classList.contains('active')) void ask(question, 'ja-JP');
        else input.value = question;
        return;
      }
    };
    r.onerror = e => {
      console.info('[Voice] Japanese browser recognition fallback:', e?.error);
      if (session === japaneseFastSession) stopFastJapaneseRecognition();
      // Existing MediaRecorder continues; its Gemini path automatically runs.
    };
    r.onend = () => {
      if (session === japaneseFastSession && !japaneseFastSucceeded) {
        stopFastJapaneseRecognition();
        // Let the backup microphone silence detector finish the clip normally.
      }
    };
    r.start();
    voiceMessage('🎙️ 日本語を認識しています…');
  } catch (e) {
    console.info('[Voice] Browser recognition unavailable; Gemini fallback', e?.name);
    stopFastJapaneseRecognition();
  }
}
let soundEnabled = true;
let recorder = null;
let recordingStream = null;
let recordingChunks = [];
let recordingTimer = null;
let silenceMonitor = null;
let audioContext = null;
let voiceStartedAt = 0;
let lastAudioSignalAt = 0;
let autoSendRecording = true;
let recordingBusy = false;
let recordingStartedAt = 0;
const IS_MOBILE_VOICE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
const MAX_RECORD_MS = IS_MOBILE_VOICE ? 8500 : 11000;
const SILENCE_MS = IS_MOBILE_VOICE ? 900 : 900; // Avoid cutting natural word pauses.
const MAX_AUDIO_BYTES = 2_100_000;
const TRANSCRIBE_API_URL = CHAT_API_URL.replace(/\/chat(?:\?.*)?$/, "/transcribe");

function voiceMessage(message) {
  if (!voiceStatus) return;
  voiceStatus.textContent = message;
  voiceStatus.hidden = !message;
}
function setListening(active) {
  if (!micButton) return;
  micButton.classList.toggle("is-listening", active);
  micButton.setAttribute("aria-pressed", String(active));
  micButton.textContent = active ? "⏹" : "🎙️";
  micButton.title = active ? "日本語音声認識中（もう一度タップして送信）" : "日本語で音声入力（話し終えると自動送信）";
  micButton.setAttribute("aria-label", micButton.title);
}
function stopSilenceDetection() {
  if (silenceMonitor) clearInterval(silenceMonitor);
  silenceMonitor = null;
  if (audioContext) {
    const context = audioContext;
    audioContext = null;
    try { const closing = context.close(); closing?.catch?.(() => {}); } catch (_) {}
  }
}
// Safari sometimes requires the audio engine to be created and resumed *inside*
// the real tap event, before the asynchronous getUserMedia permission prompt.
function unlockAudioFromTap() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioContext || audioContext.state === "closed") {
    try { audioContext = new AC(); } catch (e) { console.warn("AudioContext unavailable", e?.name); return; }
  }
  try { const p = audioContext.resume(); p?.catch?.(() => {}); } catch (_) {}
}
function startSilenceDetection(stream) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    voiceMessage("🎙️ 録音中… 自動終了できない場合は停止を押してください。");
    return;
  }
  try {
    if (!audioContext || audioContext.state === "closed") audioContext = new AC();
    const context = audioContext;
    try { context.resume()?.catch?.(() => {}); } catch (_) {}
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser); // No connection to speakers: avoids echo.
    const samples = new Float32Array(analyser.fftSize);
    let speechFrames = 0;
    let noiseFloor = 0.003;
    let validFrames = 0;
    let resumeAttempts = 0;
    voiceStartedAt = 0;
    lastAudioSignalAt = 0;
    silenceMonitor = setInterval(() => {
      if (!recorder || recorder.state !== "recording" || audioContext !== context) return;
      const now = performance.now();
      if (context.state !== "running") {
        if (++resumeAttempts <= 5) {
          try { context.resume()?.catch?.(() => {}); } catch (_) {}
        }
        return; // Safety timer always stops recording if Safari blocks analysis.
      }
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      const rms = Math.sqrt(sum / samples.length);
      if (!Number.isFinite(rms)) return;
      validFrames++;
      // Calibrate from quiet samples and adjust to different phone microphones.
      if (!voiceStartedAt && rms < 0.03) noiseFloor = noiseFloor * 0.90 + rms * 0.10;
      const threshold = Math.max(0.0055, Math.min(0.03, noiseFloor * 2.2));
      if (rms > threshold) {
        speechFrames++;
        lastAudioSignalAt = now;
        if (!voiceStartedAt && speechFrames >= 2) {
          voiceStartedAt = now;
          voiceMessage("🎙️ 聞き取り中… 話し終えたら自動送信します。");
        }
      } else {
        speechFrames = 0;
      }
      if (voiceStartedAt && now - lastAudioSignalAt >= SILENCE_MS) {
        console.info("[Voice timing] automatic silence stop", Math.round(now - recordingStartedAt), "ms");
        stopRecording();
      }
      if (validFrames === 1) console.info("[Voice] audio analysis active on", navigator.userAgent);
    }, 100);
  } catch (error) {
    console.warn("Silence detector unavailable; safety auto-stop remains", error?.name);
    stopSilenceDetection();
  }
}
function cancelRecording() {
  autoSendRecording = false;
  stopSilenceDetection();
  if (recorder?.state === "recording") {
    recorder.onstop = null;
    try { recorder.stop(); } catch (_) {}
  }
  stopMicrophoneTracks();
  recordingBusy = false;
}
function stopMicrophoneTracks() {
  stopSilenceDetection();
  if (recordingTimer) clearTimeout(recordingTimer);
  recordingTimer = null;
  recordingStream?.getTracks().forEach(track => track.stop());
  recordingStream = null;
  setListening(false);
}
function nativeDictation(message) {
  voiceMessage(message || "🎙️ キーボードのマイクから音声入力できます。");
  input.focus();
}
async function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("録音データを読み込めませんでした"));
    reader.readAsDataURL(blob);
  });
}
async function processRecording(blob) {
  if (!blob.size) { voiceMessage("⚠️ 音声が録音されませんでした。もう一度お試しください。"); return; }
  if (blob.size > MAX_AUDIO_BYTES) { voiceMessage("⚠️ 音声が長すぎます。短くお話しください。"); return; }
  if (!TRANSCRIBE_API_URL || !/^https:\/\//.test(TRANSCRIBE_API_URL)) {
    nativeDictation("⚠️ AI音声認識のURLがありません。キーボードのマイクを使用してください。"); return;
  }
  if (japaneseFastSucceeded) return;
  voiceMessage("🌍 言語を自動判定して文字に変換しています…");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const transcriptionStartedAt = performance.now();
  try {
    const audio = await toBase64(blob);
    // Report exact endpoint and network problems without exposing audio or API keys.
    // A browser TypeError/Failed to fetch means the request did not provide an HTTP response.
    const payload = JSON.stringify({ audio, mimeType: blob.type || "audio/webm" });
    let response;
    try {
      response = await fetch(TRANSCRIBE_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal
      });
    } catch (networkError) {
      // Retry once only for transient mobile network failure, never an HTTP error.
      if (networkError?.name === "AbortError") throw networkError;
      await new Promise(resolve => setTimeout(resolve, 600));
      response = await fetch(TRANSCRIBE_API_URL, {
        method: "POST", mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal
      });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    const transcript = String(result.transcript || "").trim();
    console.info("[Voice timing] transcription total:", Math.round(performance.now() - transcriptionStartedAt), "ms, audio bytes:", blob.size);
    if (japaneseFastSucceeded) return;
    if (!transcript) throw new Error("音声を認識できませんでした。もう一度お試しください。");
    const question = (input.value.trim() ? input.value.trim() + " " : "") + transcript;
    input.value = "";
    voiceMessage("✅ 音声を認識しました。質問を送信しています…");
    // The Gemini transcription preserves the spoken language in its script.
    // Let ask() infer the response language from that actual written transcript.
    if (autoSendRecording && !document.getElementById("chat").classList.contains("active")) {
      input.value = question; // Never send when the visitor has left the chat.
    } else if (autoSendRecording) {
      void ask(question);
    } else {
      input.value = question;
    }
  } catch (err) {
    console.warn("Multilingual transcription failed", err?.message);
    const isNetworkError = err instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(String(err?.message || ""));
    const explanation = err?.name === "AbortError"
      ? "通信がタイムアウトしました。短く録音して再試行してください。"
      : isNetworkError
        ? "サーバーに接続できません。通信環境・ブラウザーの通信制限を確認し、ページを更新してください。"
        : String(err?.message || "接続エラー");
    voiceMessage("⚠️ 音声認識エラー: " + explanation + " キーボードのマイクも利用できます。");
  } finally {
    clearTimeout(timeout);
    recordingBusy = false;
    if (micButton) micButton.disabled = false;
  }
}
function stopRecording() {
  if (recorder?.state === "recording") {
    recorder.stop();
  } else {
    stopMicrophoneTracks();
  }
}
async function startRecording() {
  if (recordingBusy || pendingChat) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    nativeDictation("🎙️ このブラウザーでは録音できません。Safari/ChromeのHTTPSサイトで開くか、キーボードのマイクをお使いください。");
    return;
  }
  recordingBusy = true;
  try {
    window.speechSynthesis?.cancel();
    voiceMessage("🎙️ マイクの許可を求めています…");
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    if (japaneseFastSucceeded) { stopMicrophoneTracks(); recordingBusy = false; return; }
    const preferred = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = preferred.find(type => MediaRecorder.isTypeSupported(type));
    // Low-bitrate mono voice is sufficient for speech and smaller on mobile networks.
    // Browsers may choose their own actual bitrate (especially iOS Safari).
    const recorderOptions = { audioBitsPerSecond: 24000 };
    if (mimeType) recorderOptions.mimeType = mimeType;
    try {
      recorder = new MediaRecorder(recordingStream, recorderOptions);
    } catch (_) {
      recorder = new MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined);
    }
    recordingChunks = [];
    recorder.ondataavailable = event => { if (event.data?.size) recordingChunks.push(event.data); };
    recorder.onerror = () => { voiceMessage("⚠️ 録音に失敗しました。マイクを確認してください。"); stopMicrophoneTracks(); recordingBusy = false; };
    autoSendRecording = true;
    recorder.onstop = () => {
      const audioBlob = new Blob(recordingChunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      recordingChunks = [];
      stopMicrophoneTracks();
      if (!japaneseFastSucceeded) {
        if (recognition && JAPANESE_FIRST) {
          const active = recognition;
          try { active.stop(); } catch (_) {}
          setTimeout(() => {
            if (!japaneseFastSucceeded) { stopFastJapaneseRecognition(); void processRecording(audioBlob); }
          }, 450);
        } else void processRecording(audioBlob);
      }
    };
    recorder.start();
    recordingStartedAt = performance.now();
    setListening(true);
    voiceMessage(`🎙️ 話してください。約${SILENCE_MS / 1000}秒の無音で録音終了（最大${MAX_RECORD_MS / 1000}秒）。`);
    startSilenceDetection(recordingStream);
    // Guaranteed upper bound even if iOS suspends Web Audio analysis.
    recordingTimer = setTimeout(() => {
      console.info("[Voice timing] safety auto-stop", MAX_RECORD_MS, "ms");
      stopRecording();
    }, MAX_RECORD_MS);
  } catch (err) {
    stopMicrophoneTracks(); recordingBusy = false;
    voiceMessage(err?.name === "NotAllowedError" ?
      "⚠️ マイクの使用が許可されていません。サイトのマイク設定を許可してください。" :
      "⚠️ 録音できませんでした。キーボードのマイクも使えます。");
  }
}
// Chat microphone: Japanese-only and browser-native for minimum latency.
// No parallel MediaRecorder/Gemini upload when Japanese recognition is supported.
let japaneseOnlyListening = false;
let japaneseOnlyTranscript = "";
function finishJapaneseOnlyVoice(sendQuestion) {
  const transcript = japaneseOnlyTranscript.trim();
  japaneseOnlyTranscript = "";
  japaneseOnlyListening = false;
  setListening(false);
  recognition = null;
  if (!sendQuestion || !transcript || pendingChat) {
    if (!transcript && sendQuestion) voiceMessage("⚠️ 日本語を認識できませんでした。もう一度お試しください。");
    return;
  }
  const question = (input.value.trim() ? input.value.trim() + " " : "") + transcript;
  input.value = "";
  voiceMessage("✅ 日本語を認識しました。送信しています…");
  if (document.getElementById("chat")?.classList.contains("active")) void ask(question, "ja-JP");
  else input.value = question;
}
function startJapaneseOnlyVoice() {
  if (pendingChat || japaneseOnlyListening) return;
  if (!BrowserSpeechRecognition) {
    voiceMessage("⚠️ このブラウザーは日本語の音声入力に対応していません。Chromeなどの対応ブラウザーか、キーボードの音声入力をお使いください。");
    return;
  }
  try {
    window.speechSynthesis?.cancel();
    const r = new BrowserSpeechRecognition();
    recognition = r;
    japaneseOnlyTranscript = "";
    japaneseOnlyListening = true;
    r.lang = "ja-JP";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          japaneseOnlyTranscript = String(event.results[i][0]?.transcript || "").trim();
        }
      }
    };
    r.onerror = (event) => {
      if (recognition !== r) return;
      japaneseOnlyListening = false;
      recognition = null;
      setListening(false);
      japaneseOnlyTranscript = "";
      const error = event?.error || "unknown";
      voiceMessage(error === "not-allowed" || error === "service-not-allowed"
        ? "⚠️ マイクの使用を許可してください。"
        : "⚠️ 日本語の音声認識が利用できません。もう一度お試しください。");
    };
    r.onend = () => {
      if (recognition !== r) return;
      finishJapaneseOnlyVoice(true);
    };
    r.start();
    setListening(true);
    voiceMessage("🎙️ 日本語で話してください。話し終えると自動送信します。");
  } catch (error) {
    japaneseOnlyListening = false;
    recognition = null;
    setListening(false);
    voiceMessage("⚠️ 日本語の音声入力を開始できませんでした。");
  }
}
if (micButton) {
  micButton.disabled = false;
  micButton.addEventListener("click", () => {
    if (japaneseOnlyListening && recognition) {
      // Manual stop triggers onend and sends the last final Japanese result.
      try { recognition.stop(); } catch (_) { finishJapaneseOnlyVoice(false); }
    } else {
      startJapaneseOnlyVoice();
    }
  });
}
// ---------- VOICE OUTPUT ----------

// Prefer a consistent voice on this device for every Japanese response.
// A browser/device may have different installed voices; this is not a
// cross-device identical-voice guarantee.
const JAPANESE_VOICE_RATE = 0.95;
const JAPANESE_VOICE_PITCH = 1;
let pinnedJapaneseVoice = null;

function getPinnedJapaneseVoice() {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  if (pinnedJapaneseVoice && voices.some(v => v.voiceURI === pinnedJapaneseVoice.voiceURI && v.lang === pinnedJapaneseVoice.lang)) {
    return voices.find(v => v.voiceURI === pinnedJapaneseVoice.voiceURI && v.lang === pinnedJapaneseVoice.lang);
  }
  // Prefer on-device Japanese voices to avoid differences between cloud voices.
  const japanese = voices.filter(v => /^ja(?:-|$)/i.test(v.lang));
  const chosen = japanese.find(v => v.localService && /ja-jp/i.test(v.lang)) ||
    japanese.find(v => /ja-jp/i.test(v.lang)) || japanese[0] || null;
  if (chosen) pinnedJapaneseVoice = chosen;
  return chosen;
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", getPinnedJapaneseVoice);
}

// Reply-only: select a natural available voice matching the answer language.
// No network calls are added, and the welcome narration remains unchanged.
function pickReplyVoice(voices, locale) {
  const wanted = String(locale || "en-US").toLowerCase();
  const primary = wanted.split("-")[0];
  const matches = voices.filter(v => String(v.lang || "").toLowerCase().split("-")[0] === primary);
  if (!matches.length) return null;
  return matches.sort((a, b) => {
    const score = v => {
      const name = String(v.name || "").toLowerCase();
      let n = 0;
      if (String(v.lang).toLowerCase() === wanted) n += 12;
      if (/natural|neural|enhanced|premium|high quality/.test(name)) n += 8;
      if (v.localService) n += 3;
      if (v.default) n += 1;
      return n;
    };
    return score(b) - score(a);
  })[0];
}

function speakAnswer(text, languageHint = "") {
  if (!soundEnabled || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const cleanText = String(text || "")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[🎉🍜🎮🎤🗺️🕒😊]/gu, "")
    .replace(/[*#`_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const written = detectWrittenLanguage(cleanText);
  // Honor question language, especially Japanese Romaji -> Japanese reply.
  // Only correct clearly incompatible scripts for the voice output.
  let locale = languageHint || written || "en-US";
  if (/[\u0980-\u09ff]/u.test(cleanText) && !locale.startsWith("bn")) locale = "bn-BD";
  else if (/[\u1000-\u109f]/u.test(cleanText)) locale = "my-MM";
  else if (/[\u1100-\u11ff\uac00-\ud7af]/u.test(cleanText)) locale = "ko-KR";
  else if (/[\u0900-\u097f]/u.test(cleanText) && !/^(hi|ne|mr)/i.test(locale)) locale = "hi-IN";
  else if (/[\u3040-\u30ff]/u.test(cleanText)) locale = "ja-JP";
  utterance.lang = locale;

  const isJapanese = locale.toLowerCase().startsWith("ja");
  utterance.rate = isJapanese ? JAPANESE_VOICE_RATE : 0.97;
  utterance.pitch = isJapanese ? JAPANESE_VOICE_PITCH : 1.0;
  utterance.volume = 1;

  const voices = synth.getVoices();
  const voice = isJapanese ? getPinnedJapaneseVoice() : pickReplyVoice(voices, locale);
  if (voice) utterance.voice = voice;

  // Never use an unrelated language voice; it produces confusing pronunciation.
  if (!voice && voices.length) {
    console.warn("No matching reply voice installed for", locale);
    voiceMessage("🔇 この端末には回答言語の音声がありません。端末の音声を追加してください。");
    return;
  }
  // Some browsers populate the voice list asynchronously. Use the normal
  // locale-based browser voice immediately rather than slowing down replies.
  synth.speak(utterance);
}

// ---------- SOUND TOGGLE ----------

if (!("speechSynthesis" in window)) {
  soundEnabled = false;

  soundButton.disabled = true;
  soundButton.textContent = "🔇";

  soundButton.title =
    "このブラウザーは音声回答に対応していません";

  soundButton.setAttribute(
    "aria-label",
    soundButton.title
  );

  soundButton.setAttribute("aria-pressed", "false");

} else {
  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    if (!soundEnabled) {
      window.speechSynthesis.cancel();
    }

    soundButton.textContent =
      soundEnabled ? "🔊" : "🔇";

    soundButton.title =
      soundEnabled ? "音声回答オン" : "音声回答オフ";

    soundButton.setAttribute(
      "aria-label",
      soundEnabled
        ? "音声回答をオフにする"
        : "音声回答をオンにする"
    );

    soundButton.setAttribute(
      "aria-pressed",
      String(soundEnabled)
    );
  });
}


// ---------- MOBILE-SAFE WELCOME VOICE (iOS SAFARI / ANDROID CHROME) ----------
// Autoplay is best-effort. Mobile browsers can require a real user gesture.
// One small icon toggles mute; a first tap anywhere on the welcome screen
// also unlocks speech when browser autoplay policy requires it.
const welcomeVoiceButton = document.getElementById("welcomeVoiceButton");
const welcomeVoiceHint = document.getElementById("welcomeVoiceHint");
// The visible site name stays "AI Chat Bot"; use phonetic Japanese only for spoken welcome.
const WELCOME_SPEECH = "こんにちは！東京テクニカルカレッジの学園祭へようこそ！" +
  "私は、がくえんさいエーアイです。皆さんの学園祭をサポートするチャットボットです！" +
  "学園祭のイベントや出し物、会場案内、フード、ゲーム、ステージなど、気になることを何でも聞いてください！" +
  "学校や学科についての質問にもお答えします。" +
  "文字でも音声でも質問でき、日本語のローマ字入力や、さまざまな言語にも対応しています。" +
  "さあ、一緒に学園祭を楽しみましょう！";

const canSpeakWelcome = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let welcomeMuted = false;
let welcomeUtterance = null;
let welcomeRepeatTimer = null;
let welcomeStartTimer = null;
let welcomeUnlocked = false;
let welcomePendingGesture = false;
let welcomeStarted = false;

function isWelcomeVisible() {
  return !document.hidden && !document.getElementById("intro").hidden &&
    !document.getElementById("chat").classList.contains("active");
}
function updateWelcomeButton() {
  if (!welcomeVoiceButton) return;
  welcomeVoiceButton.textContent = welcomeMuted ? "🔇" : "🔊";
  welcomeVoiceButton.setAttribute("aria-pressed", String(welcomeMuted));
  welcomeVoiceButton.setAttribute("aria-label", welcomeMuted ? "音声をオンにする" : "音声をミュート");
  welcomeVoiceButton.title = welcomeMuted ? "音声をオンにする" : "音声をミュート";
}
function welcomeStatus(message) {
  if (welcomeVoiceHint) welcomeVoiceHint.textContent = message;
}
function stopWelcomeSpeech() {
  clearTimeout(welcomeRepeatTimer);
  clearTimeout(welcomeStartTimer);
  welcomeRepeatTimer = null;
  welcomeStartTimer = null;
  welcomeUtterance = null; // invalidate callbacks before cancel
  welcomeStarted = false;
  if (canSpeakWelcome) window.speechSynthesis.cancel();
}
function repeatWelcome() {
  if (welcomeMuted || !isWelcomeVisible()) return;
  clearTimeout(welcomeRepeatTimer);
  welcomeRepeatTimer = setTimeout(() => playWelcomeSpeech(), 250);
}
function playWelcomeSpeech() {
  if (!canSpeakWelcome || welcomeMuted || !isWelcomeVisible()) return;
  stopWelcomeSpeech();
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(WELCOME_SPEECH);
  welcomeUtterance = utterance;
  utterance.lang = "ja-JP";
  utterance.rate = JAPANESE_VOICE_RATE;
  utterance.pitch = JAPANESE_VOICE_PITCH;
  const jaVoice = getPinnedJapaneseVoice();
  if (jaVoice) utterance.voice = jaVoice;
  utterance.onstart = () => {
    if (welcomeUtterance !== utterance) return;
    welcomeStarted = true;
    welcomePendingGesture = false;
    clearTimeout(welcomeStartTimer);
    welcomeStatus("音声ガイドを再生しています。");
  };
  utterance.onend = () => {
    if (welcomeUtterance !== utterance) return;
    welcomeUtterance = null;
    welcomeStarted = false;
    repeatWelcome();
  };
  utterance.onerror = (e) => {
    if (welcomeUtterance !== utterance) return;
    clearTimeout(welcomeStartTimer);
    welcomeUtterance = null;
    welcomeStarted = false;
    if (e.error === "interrupted" || e.error === "canceled") return;
    welcomePendingGesture = true;
    welcomeStatus("音声を聞くには画面を一度タップしてください。");
    // Do not loop on errors: wait for a gesture rather than spamming retries.
  };
  try {
    synth.speak(utterance);
    // Safari/Chrome may silently ignore speak() before user activation.
    // Don't continuously cancel/retry; wait for first real user gesture.
    welcomeStartTimer = setTimeout(() => {
      if (welcomeUtterance === utterance && !welcomeStarted) {
        welcomePendingGesture = true;
        welcomeStatus("音声を聞くには画面を一度タップしてください。");
      }
    }, 1800);
  } catch (e) {
    welcomeUtterance = null;
    welcomePendingGesture = true;
    welcomeStatus("音声を聞くには画面を一度タップしてください。");
  }
}
function activateWelcomeFromGesture(event) {
  if (!canSpeakWelcome || welcomeMuted || !isWelcomeVisible()) return;
  if (event?.target?.closest?.("#startButton")) return;
  welcomeUnlocked = true;
  if (welcomePendingGesture || !welcomeStarted && !window.speechSynthesis.speaking) {
    welcomePendingGesture = false;
    playWelcomeSpeech(); // synchronous during the user gesture
  }
}
if (welcomeVoiceButton) {
  updateWelcomeButton();
  if (!canSpeakWelcome) {
    welcomeVoiceButton.disabled = true;
    welcomeStatus("このブラウザーは音声読み上げに対応していません。");
  } else {
    welcomeVoiceButton.addEventListener("click", () => {
      // First tap when autoplay was blocked should ENABLE sound, not mute it.
      if (!welcomeMuted && welcomePendingGesture && !welcomeStarted) {
        welcomeUnlocked = true;
        welcomePendingGesture = false;
        playWelcomeSpeech();
        return;
      }
      welcomeMuted = !welcomeMuted;
      if (welcomeMuted) {
        stopWelcomeSpeech();
        welcomeStatus("音声はミュートされています。");
      } else {
        welcomeUnlocked = true;
        playWelcomeSpeech();
      }
      updateWelcomeButton();
    });
    const intro = document.getElementById("intro");
    intro.addEventListener("pointerdown", event => {
      if (event.target.closest?.("#welcomeVoiceButton")) return;
      activateWelcomeFromGesture(event);
    });
    intro.addEventListener("touchend", event => {
      if (event.target.closest?.("#welcomeVoiceButton")) return;
      activateWelcomeFromGesture(event);
    }, {passive:true});
    intro.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") activateWelcomeFromGesture(event);
    });
    window.addEventListener("load", () => {
      if (isWelcomeVisible()) playWelcomeSpeech();
    }, {once:true});
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopWelcomeSpeech();
      else if (!welcomeMuted && isWelcomeVisible()) {
        if (welcomeUnlocked) playWelcomeSpeech();
        else {
          welcomePendingGesture = true;
          welcomeStatus("音声を聞くには画面を一度タップしてください。");
        }
      }
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted && !welcomeMuted && isWelcomeVisible()) {
        welcomePendingGesture = true;
        welcomeStatus("音声を聞くには画面を一度タップしてください。");
      }
    });
  }
}

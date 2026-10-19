
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
  recognition?.stop();
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
const voiceLanguageSelect = document.getElementById("voiceLanguage");
let lastQuestionLanguage = "";

// Web Speech API does not reliably auto-detect spoken language.
// Auto follows the browser locale; users can choose another recognition locale.
const deviceLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "en-US";
function requestedVoiceLanguage() {
  return voiceLanguageSelect?.value !== "auto" ? voiceLanguageSelect.value : deviceLanguage;
}
function detectWrittenLanguage(text) {
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
  // For other Latin-script languages use the voice-language selector explicitly.
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

// ---------- VOICE INPUT ----------

const micButton = document.getElementById("micButton");
const soundButton = document.getElementById("soundButton");
const voiceStatus = document.getElementById("voiceStatus");

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;
let soundEnabled = true;

function voiceMessage(message) {
  voiceStatus.textContent = message;
  voiceStatus.hidden = !message;
}

function setListening(active) {
  listening = active;

  micButton.classList.toggle("is-listening", active);
  micButton.setAttribute("aria-pressed", String(active));

  micButton.title = active ? "録音を停止" : "音声で質問";
  micButton.setAttribute("aria-label", micButton.title);

  micButton.textContent = active ? "⏹" : "🎙️";
}

if (!SpeechRecognitionAPI) {
  micButton.disabled = true;
  micButton.title = "このブラウザーは音声入力に対応していません";
  micButton.setAttribute("aria-label", micButton.title);

} else {
  micButton.addEventListener("click", () => {
    if (listening) {
      recognition?.stop();
      return;
    }

    if (pendingChat) {
      voiceMessage("AIの回答をお待ちください。");
      return;
    }

    window.speechSynthesis?.cancel();

    recognition = new SpeechRecognitionAPI();

    recognition.lang = requestedVoiceLanguage();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);

      voiceMessage(
        "🎙️ 聞いています… 質問を話してください。"
      );
    };

    recognition.onresult = event => {
      const transcript =
        event.results[0][0].transcript.trim();

      if (transcript) {
        input.value = "";
        voiceMessage("");
        ask(transcript, recognition.lang);
      }
    };

    recognition.onerror = event => {
      const errorMessages = {
        "not-allowed":
          "マイクの使用をブラウザーで許可してください。",

        "audio-capture":
          "マイクが見つかりません。",

        "no-speech":
          "音声が聞き取れませんでした。",

        "network":
          "音声認識のネットワークエラーです。"
      };

      voiceMessage(
        errorMessages[event.error] ||
        "音声入力に失敗しました。"
      );
    };

    recognition.onend = () => {
      setListening(false);

      if (voiceStatus.textContent.startsWith("🎙️")) {
        voiceMessage("");
      }
    };

    try {
      recognition.start();

    } catch (error) {
      console.error("Speech recognition error:", error);

      setListening(false);

      voiceMessage(
        "音声入力を開始できませんでした。"
      );
    }
  });
}

// ---------- VOICE OUTPUT ----------

function speakAnswer(text, languageHint = "") {
  if (
    !soundEnabled ||
    !("speechSynthesis" in window)
  ) return;

  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[🎉🍜🎮🎤🗺️🕒😊]/gu, "")
    .replace(/[*#`]/g, "")
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // The user's QUESTION language is authoritative: never switch to Japanese
  // just because school names or a Japanese fragment appear in the answer.
  utterance.lang = languageHint || detectWrittenLanguage(cleanText) || "en-US";

  utterance.rate = 1;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const locale = utterance.lang.toLowerCase();
  const primaryLanguage = locale.split("-")[0];
  const voice = voices.find(v => v.lang.toLowerCase() === locale) ||
    voices.find(v => v.lang.toLowerCase().split("-")[0] === primaryLanguage);

  if (voice) {
    utterance.voice = voice;
  }

  // Do not silently choose a Japanese/English voice for Bengali or another
  // language when no suitable device voice exists.
  if (!voice && voices.length && primaryLanguage !== "en") {
    console.warn("Voice unavailable for", utterance.lang, "— install a matching device/browser voice.");
    voiceMessage("🔇 この端末には回答言語の音声がありません。端末の音声を追加してください。");
    return;
  }
  window.speechSynthesis.speak(utterance);
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
const WELCOME_SPEECH = "こんにちは！TTC 学園祭エーアイ・チャットボットへようこそ！" +
  "日本語を基本に、世界中のさまざまな言語で質問できます。" +
  "音声でも文字でも、お気軽に質問してください！";

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
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const voices = synth.getVoices();
  const jaVoice = voices.find(v => v.lang.toLowerCase() === "ja-jp") ||
    voices.find(v => v.lang.toLowerCase().startsWith("ja"));
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

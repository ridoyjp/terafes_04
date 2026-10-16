
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
  document.getElementById("intro").hidden = true;
  document.getElementById("chat").classList.add("active");
  document.getElementById("input").focus();
}

function closeChat() {
  recognition?.stop();
  window.speechSynthesis?.cancel();
  voiceMessage("");

  document.getElementById("chat").classList.remove("active");
  document.getElementById("intro").hidden = false;
  document.getElementById("startButton").focus();
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

async function getAIAnswer(question) {
  if (!CHAT_API_URL || CHAT_API_URL.includes("YOUR-WORKER")) {
    return {
      text: "⚠️ Gemini AIが設定されていません。\n\n" + answer(question),
      fallback: true
    };
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: question,
        history: chatHistory.slice(-12)
      }),

      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Gemini API HTTP Error:", response.status, data);

      throw new Error(
        data.error || `HTTP ${response.status}`
      );
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("Gemini returned an empty response");
    }

    return {
      text: data.reply.trim().slice(0, 5000),
      fallback: false
    };

  } finally {
    clearTimeout(timeout);
  }
}

// ---------- SEND MESSAGE ----------

async function ask(question) {
  question = String(question || "").trim();

  if (!question || pendingChat) return;

  pendingChat = true;

  add(question, true);

  const typing = showTyping();

  let result;

  try {
    result = await getAIAnswer(question);

  } catch (error) {
    console.error("Gemini AI Error:", error);

    result = {
      text:
        "⚠️ 現在AIサービスに接続できません。\n" +
        "しばらくしてからもう一度お試しください。\n\n" +
        answer(question),

      fallback: true
    };
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

    speakAnswer(result.text);
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

    recognition.lang = "ja-JP";
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
        ask(transcript);
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

function speakAnswer(text) {
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

  const isBangla = /[\u0980-\u09FF]/.test(cleanText);
  const isJapanese =
    /[\u3040-\u30FF\u3400-\u9FFF]/.test(cleanText);

  utterance.lang = isBangla
    ? "bn-BD"
    : isJapanese
      ? "ja-JP"
      : "en-US";

  utterance.rate = 1;
  utterance.pitch = 1;

  const voice = window.speechSynthesis
    .getVoices()
    .find(v =>
      v.lang.toLowerCase().startsWith(
        utterance.lang.slice(0, 2).toLowerCase()
      )
    );

  if (voice) {
    utterance.voice = voice;
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

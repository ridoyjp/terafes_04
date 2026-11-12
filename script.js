
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

// Keep the information panel as one view: after leaving a menu, its nested
// category must not reappear when returning from the landing page.
function resetInfoMenu() {
  if (typeof window.resetFestivalInfoMenu === "function") {
    window.resetFestivalInfoMenu();
  }
}
function closeInfoMenu() {
  setInfo(false);
  resetInfoMenu();
}

infoToggle.addEventListener("click", () => {
  if (infoList.hidden) {
    resetInfoMenu();
    setInfo(true);
  } else {
    closeInfoMenu();
  }
});

document.getElementById("infoClose").addEventListener("click", closeInfoMenu);

document.querySelectorAll("#infoList [data-q]").forEach(button => {
  button.addEventListener("click", closeInfoMenu);
});

// ---------- SCHOOL-SUPPLIED 2026 FESTIVAL GUIDE ----------
// The school XLSX has 21 location records. Several records list multiple
// activities. Each named activity gets its own button with the source room.
// Names below are exact phrases extracted from the source descriptions.
(function initFestivalFloorGuide() {
  const guide = window.TTC_FLOOR_GUIDE;
  const floorTabs = document.getElementById("floorGuideTabs");
  const categoryTabs = document.getElementById("festivalCategoryButtons");
  const eventTabs = document.getElementById("festivalEventButtons");
  const sourceTabs = document.getElementById("festivalSourceButtons");
  const roomTabs = document.getElementById("festivalRoomButtons");
  const searchInput = document.getElementById("festivalQuickSearch");
  const searchClear = document.getElementById("festivalSearchClear");
  const searchStatus = document.getElementById("festivalSearchStatus");
  const searchResults = document.getElementById("festivalSearchResults");
  if (!guide || !document.getElementById("festivalMainOptions")) return;
  const tidy = s => String(s || "").replace(/\n/g, "・").trim();

  // Tags are website navigation labels, NOT official school categories.
  const categoryTypes = [
    {id:"games", label:"🎮 ゲーム・遊び"},
    {id:"food", label:"🍰 フード・カフェ"},
    {id:"ai", label:"🤖 AI・科学・IT"},
    {id:"craft", label:"🧩 ものづくり・体験"},
    {id:"show", label:"🖼️ 展示・発表"},
    {id:"build", label:"🏠 建築・インテリア"},
    {id:"art", label:"🎨 アート・デザイン"},
    {id:"help", label:"ℹ️ 相談・施設"}
  ];

  // Every label must exist verbatim in the referenced XLSX description.
  // For combined phrases (e.g. マイクラ＆カプラ), use exact source substrings.
  const activityIndex = {
    "B2": [
      ["3Dプリンター体験", "ai", "craft"],
      ["IoTセンサー可視化体験", "ai", "craft"]
    ],
    "E2": [
      ["データサイエンス体験ブース", "ai", "craft"],
      ["異文化交流ボドゲカフェ", "games"]
    ],
    "E3": [["学習成果展示", "show"]],
    "B4": [
      ["マイクラ", "games", "build", "craft"],
      ["カプラ", "games", "build", "craft"],
      ["ストロービルディング", "build", "craft"]
    ],
    "B5": [["風船プール", "games"], ["バルーンアート", "art", "craft"]],
    "E5": [["模型体験コーナー", "build", "craft"]],
    "B6": [["ヒンメリ作成", "art", "craft"]],
    "B7": [["学生が作ったゲーム展示&プレイ体験", "games", "show"]],
    "F7": [["2年生のゲーム制作物の発表", "games", "show"]],
    "B8": [["ミニゆるメカトロ in TTC Festival 2026", "ai", "craft"]],
    "F8": [["パーソナルカラー診断", "art", "craft"]],
    "B9": [
      ["1年展示：ホームページ制作展示と閲覧", "ai", "show"],
      ["2年展示：生成ＡＩを使ったアプリ展示と閲覧", "ai", "show"],
      ["生成AIによる目押しゲーム", "ai", "games"],
      ["ゲームをして、お菓子をＧｅｔ！", "games"]
    ],
    "E9": [["スクリーンアトラクション", "games", "craft"]],
    "E10": [["学生作品展示", "show"]],
    "B11": [["クイズ「何の動物？」", "games", "craft"]],
    "E11": [
      ["RJP活動報告", "show"],
      ["バスボム作り", "craft"],
      ["カゼインプラスチック作り", "ai", "craft"],
      ["カラメル作り体験", "craft"],
      ["ステンドグラスクッキー作り体験", "craft", "art"],
      ["オリジナル小瓶クラフト", "craft", "art"]
    ],
    "C12": [["コーヒーコーナー", "food"]],
    "D12": [["世界のお菓子コーナー", "food"]],
    "F12": [["入学相談コーナー", "help"]],
    "G12": [["エコステーション", "help"]],
    "B13": [["建築系学科 成果展示会", "build", "show"]]
  };

  const activities = [];
  for (const entry of guide.entries) {
    const source = entry.source_cells?.[0];
    const parts = activityIndex[source];
    if (!parts) {
      console.error("Missing festival activity mapping", source);
      continue;
    }
    for (const [name, ...categories] of parts) {
      if (!entry.description.includes(name)) {
        console.error("Festival activity mismatch with school XLSX", source, name);
        continue;
      }
      activities.push({name, categories, entry});
    }
  }
  // Available for transparent verification/testing; this is read-only source
  // data and not a remote API or separate school event list.
  window.TTC_FESTIVAL_ACTIVITIES = activities;
  const count = document.getElementById("floorGuideCount");
  if (count) count.textContent = `${guide.floors.length}フロア・${guide.entries.length}項目`;
  const activityCount = document.getElementById("festivalActivityCount");
  if (activityCount) activityCount.textContent = `${activities.length}企画`;

  function roomName(entry) {
    return entry.room ? `／${tidy(entry.room)}${/^[0-9\s\n]+$/.test(entry.room) ? "号室" : ""}` : "（部屋番号の記載なし）";
  }
  function parentDetails(entry) {
    const dept = entry.department ? `\n担当：${tidy(entry.department)}` : "";
    const schedule = entry.schedule ? `\n記載日時：${tidy(entry.schedule)}` : "";
    return `${dept}${schedule}`;
  }
  function floorAnswer(entries) {
    if (!entries.length) return "学校資料には該当する情報がありません。";
    return "📍 TTC FESTIVAL 2026 学校提供フロアガイド\n\n" + entries.map(e =>
      `■ ${e.floor}${roomName(e)}\n${e.description}${parentDetails(e)}`
    ).join("\n\n") + "\n\n※ 学校資料にない会場情報・料金は推測していません。";
  }
  function activityAnswer(items) {
    if (!items.length) return "学校資料には該当する企画がありません。";
    return "📍 TTC FESTIVAL 2026 企画案内\n\n" + items.map(a => {
      const e = a.entry;
      // Show complete school-supplied description as well as the selected
      // activity, so no associated instructions/times are silently dropped.
      return `■ ${a.name}\n場所：${e.floor}${roomName(e)}${parentDetails(e)}\n学校資料の内容：${e.description}`;
    }).join("\n\n") + "\n\n※ 部屋・日時が記載されていない場合は推測していません。";
  }

  function makeButton(parent, label, question, response, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = kind;
    btn.textContent = label;
    btn.setAttribute("aria-label", `${label}の場所と内容をチャットで確認`);
    btn.addEventListener("click", () => {
      if (pendingChat) return;
      closeInfoMenu();
      ask(question, "ja-JP", response);
    });
    parent.appendChild(btn);
    return btn;
  }

  // Small, conversational menu. Only school-verified information is used.
  // All 21 source entries and 34 named activities remain available through
  // progressive suggestions instead of rendering 80+ buttons at once.
  const roomChoices = guide.entries.flatMap(entry => {
    const raw = String(entry.room || "").trim();
    if (!raw) return [];
    const split = raw.split(/\s+/u).filter(Boolean);
    if (split.length === 2 && split.every(x => /^\d{3,4}$/.test(x))) {
      return split.map(room => ({entry, room, shared: true}));
    }
    return [{entry, room: raw.replace(/\s+/gu, ""), shared: false}];
  });
  window.TTC_FESTIVAL_ROOM_CHOICES = roomChoices;
  const mainOptions = document.getElementById("festivalMainOptions");
  const chips = document.getElementById("festivalSuggestionChoices");
  const controlBar = document.getElementById("festivalSuggestionControls");
  const suggestions = document.getElementById("festivalSmartSuggestions");
  const suggestionTitle = document.getElementById("festivalSuggestionTitle");
  const suggestionCounter = document.getElementById("festivalSuggestionCounter");
  const PAGE = 1000;
  if (!mainOptions || !chips || !controlBar || !suggestions) return;

  const categoryLabel = {
    games:"ゲーム・体験", food:"フード・カフェ", ai:"AI・展示",
    floors:"フロア・部屋", all:"すべての企画"
  };
  // Room labels are normalized only for readability; location facts still
  // come from the uploaded school spreadsheet. 405/407 stay jointly listed.
  const roomDisplay = e => {
    const raw = String(e.room || "").trim();
    if (!raw) return "部屋番号未記載";
    const rooms = raw.split(/\s+/u).filter(Boolean);
    if (rooms.length > 1 && rooms.every(r => /^\d+$/.test(r))) {
      return rooms.map(r => `${r}号室`).join("・") + "（一括掲載）";
    }
    if (/^\d+$/.test(raw)) return `${raw}号室`;
    return raw.replace(/\s+/gu, "");
  };
  const conciseLocation = e => `${e.floor} ${roomDisplay(e)}`;
  const sectionIntro = (title, n) => `${title}は${n}件あります\n情報一覧のメニューから選ぶと場所と内容をご案内します`;

  let currentView = null;
  let previousViews = [];
  let currentPage = 0;

  function view(title, items, page = 0, keepHistory = true) {
    if (keepHistory && currentView) {
      previousViews.push({data:currentView, page:currentPage});
      if (previousViews.length > 15) previousViews.shift();
    }
    currentView = {title, items};
    currentPage = page;
    renderSuggestions();
  }
  function makeChoice(label, onClick, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", () => { if (!pendingChat) onClick(); });
    return button;
  }
  function renderSuggestions() {
    chips.replaceChildren();
    controlBar.replaceChildren();
    if (!currentView) return;
    const {items,title} = currentView;
    const atHome = title === "何を調べますか？";
    // Never add a separate suggestion panel to the chat transcript.
    // Contextual choices are shown only inside the information menu.
    mainOptions.hidden = !atHome;
    suggestions.hidden = atHome;
    if (atHome) return;
    // Show all matching options on one scrollable menu page.
    currentPage = 0;
    suggestionTitle.textContent = title;
    suggestionCounter.textContent = "";
    for (const item of items) {
      chips.appendChild(makeChoice(item.label, item.action, "festival-suggestion-chip"));
    }
    if (previousViews.length) {
      controlBar.appendChild(makeChoice("↩ 戻る", () => {
        const previous = previousViews.pop();
        currentView = previous.data;
        currentPage = previous.page;
        renderSuggestions();
      },"festival-suggestion-control"));
    }

  }
  function showHome() {
    previousViews = [];
    currentView = {title:"何を調べますか？", items:menuItems};
    currentPage = 0;
    renderSuggestions();
  }
  // The top 情報一覧 button always returns to the original five choices.
  window.resetFestivalInfoMenu = showHome;
  function localChat(question, answerText) {
    if (pendingChat) return;
    closeInfoMenu();
    // The school answer bypasses the AI API and cannot hallucinate a room.
    window.__ttcGuidedNavigation = true;
    try { ask(question, "ja-JP", answerText); }
    finally { window.__ttcGuidedNavigation = false; }
  }
  const activityChoice = activity => ({
    label:`${activity.entry.floor} ${activity.name}`,
    action:() => {
      const e = activity.entry;
      const place = conciseLocation(e);
      const dept = e.department ? `\n担当 ${tidy(e.department)}` : "";
      const when = e.schedule ? `\n開催日時 ${tidy(e.schedule)}` : "";
      const shared = /^405\s+407$/u.test(String(e.room || "").trim()) ? "\n学校の資料では405号室と407号室をまとめて掲載しています\n個別の部屋割りは記載されていません" : "";
      const unknown = e.room ? "" : "\n部屋番号は学校資料に記載されていません";
      // A name-only answer can omit official details such as 1F café location,
      // exhibition contents, joint-room notes or 7F programme times.
      // Always include the entire, unchanged description from the XLSX row.
      const sourceDescription = `\n学校資料の記載内容\n${e.description}`;
      const reply = `${activity.name}\n場所 ${place}${dept}${when}${sourceDescription}${shared}${unknown}`;
      localChat(`${activity.name}はどこですか`, reply);
    }
  });
  function showActivities(label, filtered) {
    // Menu navigation stays in the menu; no duplicate chip strip under chat.
    view(`${label}  ${filtered.length}件`, filtered.map(activityChoice));
  }
  function entryAnswer(entry, title) {
    const notes = entry.room ? "" : "\n部屋番号は学校資料に記載されていません";
    return `${title}\n場所 ${conciseLocation(entry)}\n${entry.description}${parentDetails(entry)}${notes}`;
  }
  function roomChoice(choice) {
    const e = choice.entry;
    const place = choice.shared ? `${e.floor} 405号室と407号室の共同掲載` : conciseLocation(e);
    const note = choice.shared ? "\n学校の資料では405号室と407号室が一緒に掲載されているため各企画の部屋は断定できません" : "";
    return {
      label:`${e.floor} ${/^\d+$/.test(choice.room) ? choice.room + "号室" : choice.room}`,
      action: () => localChat(`${place}には何がありますか`, `${place}\n${e.description}${parentDetails(e)}${note}`)
    };
  }
  const floorChoice = floor => ({
    label:`🏢 ${floor}`,
    action: () => {
      const rooms = roomChoices.filter(c => c.entry.floor === floor);
      const sameFloor = activities.filter(a => a.entry.floor === floor);
      const options = rooms.length ? rooms.map(roomChoice) : sameFloor.map(activityChoice);
      // Retain school activities whose room is not listed, without fabricating it.
      if (rooms.length) options.push(...sameFloor.filter(a => !a.entry.room).map(activityChoice));
      view(`${floor} の部屋と企画`, options);
    }
  });
  const menuItems = [
    {label:"🎮 ゲーム・体験", action:() => showActivities("ゲーム・体験", activities.filter(a=>a.categories.includes("games")||a.categories.includes("craft")))},
    {label:"☕ フード・カフェ", action:() => showActivities("フード・カフェ", activities.filter(a=>a.categories.includes("food")))},
    {label:"🤖 AI・展示", action:() => showActivities("AI・展示", activities.filter(a=>a.categories.includes("ai")||a.categories.includes("show")))},
    {label:"🏢 フロア・部屋", action:() => view("フロアを選んでください", guide.floors.map(floorChoice))},
    {label:"📚 すべての企画", action:() => showActivities("すべての企画",activities)}
  ];
  // Quick links reuse the same Excel-grounded information menu actions.
  document.querySelectorAll("[data-quick-nav]").forEach(button => {
    button.addEventListener("click", () => {
      if (pendingChat) return;
      // Switching a quick category replaces the previously opened menu.
      resetInfoMenu();
      setInfo(true);
      const index = ["games","food","ai","floors","all"].indexOf(button.dataset.quickNav);
      if (index >= 0) menuItems[index].action();
    });
  });
  mainOptions.querySelectorAll("[data-festival-nav]").forEach(button => {
    button.addEventListener("click", () => {
      if (pendingChat) return;
      const index = ["games","food","ai","floors","all"].indexOf(button.dataset.festivalNav);
      if (index >= 0) menuItems[index].action();
    });
  });
  showHome();

  // After a typed/voice question, offer a short contextual path instead of
  // opening a giant static list. No extra network calls are made for chips.
  window.refreshGuideSuggestionsForQuestion = question => {
    const q = String(question || "").normalize("NFKC");
    const roomMatch = q.match(/(?:^|[^0-9])(\d{3,4})(?:号室)?/);
    if (roomMatch) {
      const matched = roomChoices.filter(c=>c.room===roomMatch[1]);
      if (matched.length) {view(`${roomMatch[1]}号室を調べる`,matched.map(roomChoice));return;}
    }
    const floorMatch = q.match(/(?:11|10|9|7|6|5|4|1|B1)F/i);
    if (floorMatch) {
      const floor = floorMatch[0].toUpperCase();
      if (guide.floors.includes(floor)) {view(`${floor} のご案内`,[floorChoice(floor)]);return;}
    }
    if (/食べ物|フード|カフェ|コーヒー|お菓子|food/i.test(q)) {
      view("フード・カフェ", activities.filter(a=>a.categories.includes("food")).map(activityChoice));return;
    }
    if (/ゲーム|遊び|game/i.test(q)) {
      view("ゲーム・体験", activities.filter(a=>a.categories.includes("games")).map(activityChoice));return;
    }
    if (/AI|展示|IT|情報処理/i.test(q)) {
      view("AI・展示", activities.filter(a=>a.categories.includes("ai")||a.categories.includes("show")).map(activityChoice));return;
    }
    if (/どこ|場所|部屋|フロア/.test(q)) {
      view("フロアを選んでください",guide.floors.map(floorChoice));return;
    }
    showHome();
  };
  // The legacy top/side shortcut buttons still answer from the XLSX.
  window.getTtcFestivalMenuAnswer = question => {
    const q = String(question || "");
    if (/食べ物|フード|ドリンク|food/i.test(q)) return sectionIntro("フード・カフェ",activities.filter(a=>a.categories.includes("food")).length);
    if (/ゲーム|game/i.test(q)) return sectionIntro("ゲーム",activities.filter(a=>a.categories.includes("games")).length);
    if (/会場の場所|会場案内|会場ガイド|フロアガイド|^場所$/.test(q)) return "案内できるフロアは11F 10F 9F 7F 6F 5F 4F 1F B1Fです\n情報一覧のメニューからフロアを選んでください";
    return "";
  };
  window.TTC_FESTIVAL_NAV_DIAGNOSTICS = Object.freeze({
    activities:activities.length, records:guide.entries.length,
    floors:guide.floors.length, namedRooms:roomChoices.length, pageSize:PAGE
  });

})();

// ---------- PAGE NAVIGATION ----------

document.getElementById("introLogo").src =
  document.querySelector(".head img").src;

function openChat() {
  // Start Now must never restore an old information category from before Back.
  closeInfoMenu();
  stopWelcomeSpeech();
  stopReplySpeech();
  document.getElementById("intro").hidden = true;
  document.getElementById("chat").classList.add("active");
  if (window.matchMedia("(min-width: 901px)").matches) {
    document.getElementById("input").focus();
  }
}

function closeChat() {
  // Back means leave the entire chat view, not just the conversation area.
  closeInfoMenu();
  japaneseOnlyListening = false;
  japaneseOnlyTranscript = "";
  setListening(false);
  stopFastJapaneseRecognition();
  cancelRecording();
  stopReplySpeech();
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

// Welcome shortcuts open the chat before sending a question.
// Existing [data-q] chat shortcuts and Gemini backend are unchanged.
document.querySelectorAll("[data-intro-question]").forEach(button => {
  button.addEventListener("click", () => {
    const question = button.dataset.introQuestion;
    openChat();
    const sheetAnswer = window.getTtcFestivalMenuAnswer?.(question) || "";
    if (question) ask(question, sheetAnswer ? "ja-JP" : "", sheetAnswer);
  });
});

// ---------- CHAT ELEMENTS ----------

const BOT_ICON = "assets/robot-logo.png";

const messages = document.getElementById("messages");
const input = document.getElementById("input");

// Existing welcome bubble also follows the same readable-text rule.


// Chat bubbles show words and room/floor details without decorative noise.
// Keep line breaks for the 34 festival activities and preserve source data
// separately for API requests, chat history and the unchanged school XLSX.
function cleanVisibleChatText(value) {
  const text = String(value ?? "")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, "ウェブアドレス")
    .replace(/<[^>]*>/g, " ")
    .replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?=\D|$)/g, (_, y, m, d) => `${y}年${Number(m)}月${Number(d)}日`)
    .replace(/(?<!\d)(\d{1,2})\/(\d{1,2})(?!\d)/g, (_, m, d) => `${Number(m)}月${Number(d)}日`)
    .replace(/(\d{1,2})[:：](\d{2})(?=\D|$)/g, "$1時$2分")
    .replace(/[\u200c\u200d\ufe0e\ufe0f]/gu, "")
    .replace(/(?<=[=*_{}|\\])[!?！？](?=[=*_{}|\\])/gu, ""); // decorative != sentence punctuation
  const japanese = /[\u3040-\u30ff\u3400-\u9fff]/u.test(text);
  return (japanese ? text.replace(/,/g, "、").replace(/(?<!\d)\.(?!\d)/g, "。").replace(/\?/g, "？").replace(/!/g, "！") : text)
    .replace(/[^\p{L}\p{M}\p{N}\s、。！？・,.?!]/gu, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([、。！？,.?!])/gu, "$1")
    .replace(/ *\r?\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

messages.querySelectorAll(".bubble").forEach(bubble => {
  bubble.textContent = cleanVisibleChatText(bubble.textContent);
});

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
  bubble.textContent = cleanVisibleChatText(text);

  row.append(avatar, bubble);
  messages.appendChild(row);

  messages.scrollTop = messages.scrollHeight;
}

// ---------- LOCAL FALLBACK ANSWERS ----------

function answer(question) {
  const q = question.toLowerCase();

  if (/食|food|飲|屋台|グルメ|たべ/.test(q)) {
    return "学校のフロアガイドには1Fのコーヒーコーナーと世界のお菓子コーナーが載っています。メニューや料金は記載されていません。";
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
    return "学校のフロアガイドに載っている展示や体験は情報一覧から選べます。";
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
  // A Japanese event name inside an English question is still English.
  if (/\b(?:where|what|when|why|how|please|the|is|are|does|could|would|tell|show|about)\b/.test(q) &&
      !/\b(?:desu|desuka|masu|masuka|oshiete|kudasai|onegaishimasu)\b/.test(q)) return false;
  const japanesePhrases = /\b(?:konnichiwa|arigatou|watashi|gakuensai|geemu|kaijou|heya|desu|desuka|desu ka|masu|masuka|masu ka|arimasu|arimasuka|kudasai|onegaishimasu|oshiete|shiritai|dare|doko|itsu|nanji|nani|nan desu|donna|douyatte|ikikata|kouchou|kocho|fukukouchou|sensei|gakka|gakuen|gakusai|gakuensai|nyuugaku|jugyouryou|ryuugakusei|shushoku|shikaku|jyuusho|juusho|denwa|koukou|senmon|daigaku|wa dare|wa doko|wa nani|ni tsuite|no koto|tte nani|oshiete kudasai)\b/i;
  const ttcSchoolRomaji = /\b(?:ttc|tokyo technical college|tokyo tekunikaru karejji|tokyo technical|higashi nakano)\b/i.test(q);
  const japaneseGrammar = /\b(?:wa|no|ni|de|ga|wo|o)\b/i.test(q);
  return japanesePhrases.test(q) || (ttcSchoolRomaji && japaneseGrammar);
}

// Small, offline Romaji -> Japanese keyboard helper. English and mixed-script
// messages are left intact. Full Kanji conversion requires the device's IME.
const ROMAJI_KANA = Object.freeze({
  a:"あ",i:"い",u:"う",e:"え",o:"お",ka:"か",ki:"き",ku:"く",ke:"け",ko:"こ",
  sa:"さ",shi:"し",si:"し",su:"す",se:"せ",so:"そ",ta:"た",chi:"ち",ti:"ち",tsu:"つ",tu:"つ",te:"て",to:"と",
  na:"な",ni:"に",nu:"ぬ",ne:"ね",no:"の",ha:"は",hi:"ひ",fu:"ふ",hu:"ふ",he:"へ",ho:"ほ",
  ma:"ま",mi:"み",mu:"む",me:"め",mo:"も",ya:"や",yu:"ゆ",yo:"よ",ra:"ら",ri:"り",ru:"る",re:"れ",ro:"ろ",
  wa:"わ",wi:"うぃ",we:"うぇ",wo:"を",ga:"が",gi:"ぎ",gu:"ぐ",ge:"げ",go:"ご",
  za:"ざ",ji:"じ",zi:"じ",zu:"ず",ze:"ぜ",zo:"ぞ",da:"だ",di:"ぢ",du:"づ",de:"で",do:"ど",
  ba:"ば",bi:"び",bu:"ぶ",be:"べ",bo:"ぼ",pa:"ぱ",pi:"ぴ",pu:"ぷ",pe:"ぺ",po:"ぽ",
  kya:"きゃ",kyu:"きゅ",kyo:"きょ",sha:"しゃ",shu:"しゅ",sho:"しょ",sya:"しゃ",syu:"しゅ",syo:"しょ",
  cha:"ちゃ",chu:"ちゅ",cho:"ちょ",tya:"ちゃ",tyu:"ちゅ",tyo:"ちょ",nya:"にゃ",nyu:"にゅ",nyo:"にょ",
  hya:"ひゃ",hyu:"ひゅ",hyo:"ひょ",mya:"みゃ",myu:"みゅ",myo:"みょ",rya:"りゃ",ryu:"りゅ",ryo:"りょ",
  gya:"ぎゃ",gyu:"ぎゅ",gyo:"ぎょ",ja:"じゃ",ju:"じゅ",jo:"じょ",jya:"じゃ",jyu:"じゅ",jyo:"じょ",
  bya:"びゃ",byu:"びゅ",byo:"びょ",pya:"ぴゃ",pyu:"ぴゅ",pyo:"ぴょ",
  fa:"ふぁ",fi:"ふぃ",fe:"ふぇ",fo:"ふぉ",thi:"てぃ",thu:"とぅ",dhi:"でぃ",dhu:"どぅ",
  tsa:"つぁ",tsi:"つぃ",tse:"つぇ",tso:"つぉ",che:"ちぇ",she:"しぇ",je:"じぇ",
  xa:"ぁ",xi:"ぃ",xu:"ぅ",xe:"ぇ",xo:"ぉ",la:"ぁ",li:"ぃ",lu:"ぅ",le:"ぇ",lo:"ぉ",xtsu:"っ",ltsu:"っ"
});
const ROMAJI_TTC_WORDS = Object.freeze({
  gakuensai:"学園祭",gakusai:"学園祭",gakkou:"学校",gakka:"学科",kaijou:"会場",heya:"部屋",
  geemu:"ゲーム",game:"ゲーム",fuudo:"フード",food:"フード",furoa:"フロア",floor:"フロア",
  kafe:"カフェ",cafe:"カフェ",koohii:"コーヒー",kohi:"コーヒー",toire:"トイレ",
  watashi:"わたし",wa:"は",o:"を",e:"へ",oshiete:"教えて",kudasai:"ください",
  doko:"どこ",dokodesu:"どこです",desuka:"ですか",desu:"です",masuka:"ますか",masu:"ます",
  arimasuka:"ありますか",arimasu:"あります",konnichiwa:"こんにちは",arigatou:"ありがとう",
  onegaishimasu:"お願いします",tetsudatte:"手伝って",shiritai:"知りたい",chikaku:"近く",
  nanji:"何時",itsu:"いつ",nani:"なに",nandesuka:"何ですか",ikikata:"行き方"
});
function romajiWordToJapanese(token) {
  if (/^[A-Z]{2,}$/.test(token)) return token; // AI, TTC, etc.
  const lower = token.toLowerCase();
  if (ROMAJI_TTC_WORDS[lower]) return ROMAJI_TTC_WORDS[lower];
  let result = "";
  for (let i = 0; i < lower.length;) {
    const c = lower[i];
    if (!/[a-z]/.test(c)) { result += c; ++i; continue; }
    if (i + 1 < lower.length && c === lower[i+1] && /[bcdfghjklmpqrstvwxyz]/.test(c) && c !== "n") {
      result += "っ"; ++i; continue;
    }
    if (c === "n" && (i + 1 === lower.length || lower[i+1] === "'" || (!/[aiueoyn]/.test(lower[i+1])))) {
      result += "ん"; i += lower[i+1] === "'" ? 2 : 1; continue;
    }
    if (c === "n" && lower[i+1] === "n") {
      result += "ん";
      i += /[aiueoy]/.test(lower[i+2] || "") ? 1 : 2;
      continue;
    }
    let found = false;
    for (const size of [4,3,2,1]) {
      const key = lower.slice(i,i+size);
      if (ROMAJI_KANA[key]) { result += ROMAJI_KANA[key]; i+=size; found=true; break; }
    }
    if (!found) return token; // Unknown English/technical word: preserve it.
  }
  return result;
}
function prepareTypedQuestion(text) {
  const original = String(text || "").trim();
  // No changes to native Japanese IME, English, Bengali, or other languages.
  if (!isJapaneseRomaji(original)) return original;
  return original.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, token => romajiWordToJapanese(token))
    .replace(/(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])[ \t]+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "")
    .replace(/,/g,"、").replace(/\./g,"。").replace(/\?/g,"？").replace(/!/g,"！");
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
  if (error?.status === 503) return "⚠️ AIが一時的に利用できません。少し待って再試行してください。管理者はWorkerログをご確認ください。";
  if (error?.status === 502) return "⚠️ Geminiから回答を取得できませんでした。管理者はCloudflare WorkerログのGemini API Errorをご確認ください。";
  if (error?.status === 504) return "⚠️ AIの応答が時間切れになりました。通信環境を確認し、しばらくしてからお試しください。";
  if (error?.message === "AI_API_NOT_CONFIGURED") return "⚠️ AI APIのURLが設定されていません。config.jsを確認してください。";
  return "⚠️ 現在AIサービスに接続できません。通信環境を確認してもう一度お試しください。";
}

// ---------- SEND MESSAGE ----------

async function ask(question, spokenLanguage = "", schoolGuideAnswer = "") {
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
    const floorReply = schoolGuideAnswer || window.answerTtcFloorGuide?.(question, languageHint);
    result = floorReply
      ? { text: floorReply, fallback: false }
      : await getAIAnswer(question, languageHint);

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
  // The information menu owns navigation; nothing is appended below chat.
}

// ---------- CHAT FORM ----------

document.getElementById("form").addEventListener("submit", event => {
  event.preventDefault();

  const question = prepareTypedQuestion(input.value);

  if (!question || pendingChat) return;

  input.value = "";
  ask(question);
});

// ---------- QUICK QUESTION BUTTONS ----------

document.querySelectorAll("[data-q]").forEach(button => {
  button.addEventListener("click", () => {
    closeInfoMenu();
    const question = button.dataset.q;
    const schoolAnswer = window.getTtcFestivalMenuAnswer?.(question) || "";
    ask(question, schoolAnswer ? "ja-JP" : "", schoolAnswer);
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
const SILENCE_MS = IS_MOBILE_VOICE ? 650 : 700; // Avoid cutting natural word pauses.
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
  voiceMessage("🎙️ 日本語の音声を文字に変換しています…");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const transcriptionStartedAt = performance.now();
  try {
    const audio = await toBase64(blob);
    // Report exact endpoint and network problems without exposing audio or API keys.
    // A browser TypeError/Failed to fetch means the request did not provide an HTTP response.
    const payload = JSON.stringify({ audio, mimeType: blob.type || "audio/webm", language: "ja-JP" });
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
      void ask(question, "ja-JP");
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
    stopReplySpeech();
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
    recordingStream.getAudioTracks().forEach(track => { track.onended = () => { if (recorder?.state === "recording") stopRecording(); }; });
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
    try { recorder.start(250); } catch (_) { recorder.start(); }
    recordingStartedAt = performance.now();
    setListening(true);
    voiceMessage(`🎙️ 話してください。約${SILENCE_MS / 1000}秒の無音で録音終了（最大${MAX_RECORD_MS / 1000}秒）。`);
    // Mobile browsers sometimes revoke the microphone on lock/call/device change.
    // End the recording cleanly rather than leaving an indefinitely active button.
    for (const track of recordingStream.getAudioTracks()) {
      track.addEventListener('ended', () => {
        if (recorder?.state === 'recording') stopRecording();
      }, {once:true});
    }
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
// ---------- JAPANESE-FIRST FAST VOICE INPUT ----------
// Japanese Web Speech runs first for low latency. If browser STT is missing or
// has a service/network failure, Japanese Gemini audio transcription is an
// explicit fallback. The fallback can be slower and needs microphone access.
let japaneseOnlyListening = false;
let japaneseOnlyTranscript = "";
let japaneseVoiceSession = 0;
let speechRecognitionFailures = 0;

function finishJapaneseOnlyVoice(sendQuestion) {
  const transcript = japaneseOnlyTranscript.trim();
  japaneseOnlyTranscript = "";
  japaneseOnlyListening = false;
  const active = recognition;
  recognition = null;
  if (active) {
    active.onresult = null;
    active.onerror = null;
    active.onend = null;
    try { active.abort(); } catch (_) {}
  }
  setListening(false);
  if (!sendQuestion || !transcript || pendingChat) {
    if (!transcript && sendQuestion) voiceMessage("⚠️ 日本語を認識できませんでした。もう一度お試しください。");
    return;
  }
  speechRecognitionFailures = 0;
  const question = (input.value.trim() ? input.value.trim() + " " : "") + transcript;
  input.value = "";
  voiceMessage("✅ 日本語を認識しました。質問を送信しています…");
  if (document.getElementById("chat")?.classList.contains("active")) void ask(question, "ja-JP");
  else input.value = question;
}

function japaneseAudioFallback(message = "🎙️ 日本語の録音に切り替えます。話し終えたら自動送信します。") {
  if (pendingChat || recordingBusy || !document.getElementById("chat")?.classList.contains("active")) return;
  voiceMessage(message);
  // Safari may require user activation for the recording permission. If it
  // cannot start, the user receives a Japanese error and can use keyboard mic.
  unlockAudioFromTap();
  void startRecording();
}

function startJapaneseOnlyVoice() {
  if (pendingChat || japaneseOnlyListening || recordingBusy) return;
  if (!BrowserSpeechRecognition || speechRecognitionFailures >= 2) {
    japaneseAudioFallback("🎙️ 日本語の音声を録音します。話し終えたら自動送信します。");
    return;
  }
  const session = ++japaneseVoiceSession;
  try {
    stopReplySpeech();
    const r = new BrowserSpeechRecognition();
    recognition = r;
    japaneseOnlyTranscript = "";
    japaneseOnlyListening = true;
    r.lang = "ja-JP";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = event => {
      if (recognition !== r || session !== japaneseVoiceSession) return;
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const segment = String(event.results[i][0]?.transcript || "").trim();
        if (event.results[i].isFinal) finalText += segment;
        else interimText += segment;
      }
      if (finalText) {
        japaneseOnlyTranscript = finalText;
        // Send as soon as a final transcript exists; don't wait for onend.
        finishJapaneseOnlyVoice(true);
      } else if (interimText) {
        voiceMessage("🎙️ 聞き取り中: " + interimText.slice(0, 90));
      }
    };
    r.onerror = event => {
      if (recognition !== r || session !== japaneseVoiceSession) return;
      const error = event?.error || "unknown";
      japaneseOnlyListening = false;
      recognition = null;
      japaneseOnlyTranscript = "";
      setListening(false);
      r.onend = null;
      // A denied microphone permission must not trigger a second permission
      // prompt. A provider failure can fall back to Japanese audio upload.
      if (error === "not-allowed" || error === "audio-capture") {
        voiceMessage("⚠️ マイクへのアクセスを許可してください。端末のキーボード音声入力も使えます。");
      } else if (error === "no-speech" || error === "aborted") {
        voiceMessage("⚠️ 声を確認できませんでした。もう一度マイクを押して話してください。");
      } else {
        speechRecognitionFailures += 1;
        japaneseAudioFallback("🎙️ ブラウザーの音声認識が利用できないため、日本語録音を試します。");
      }
    };
    r.onend = () => {
      if (recognition !== r || session !== japaneseVoiceSession) return;
      if (japaneseOnlyTranscript.trim()) finishJapaneseOnlyVoice(true);
      else {
        japaneseOnlyListening = false;
        recognition = null;
        setListening(false);
        voiceMessage("⚠️ 日本語の音声を認識できませんでした。もう一度お試しください。");
      }
    };
    r.start();
    setListening(true);
    voiceMessage("🎙️ 日本語で話してください。話し終えたら自動送信します。");
  } catch (_) {
    japaneseOnlyListening = false;
    recognition = null;
    setListening(false);
    speechRecognitionFailures += 1;
    japaneseAudioFallback();
  }
}

if (micButton) {
  micButton.disabled = false;
  micButton.addEventListener("click", () => {
    if (recordingBusy) {
      stopRecording(); // manual stop for server-fallback recording
    } else if (japaneseOnlyListening && recognition) {
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
const JAPANESE_VOICE_RATE = 1.08; // Slightly quicker Japanese chat replies, without artificial per-sentence delays
const WELCOME_VOICE_RATE = 0.98; // Same natural pace for home narration
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
  const chosen = [...japanese].sort((a, b) => {
    const score = v => {
      const name = String(v.name || "").toLowerCase();
      return (/natural|neural|enhanced|premium/.test(name) ? 8 : 0) +
        (/ja-jp/i.test(v.lang) ? 4 : 0) + (v.localService ? 2 : 0);
    };
    return score(b) - score(a);
  })[0] || null;
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

// The browser's Japanese voice handles punctuation as prosody inside ONE
// utterance. Do not manually stop after every comma or sentence: doing so
// caused an unnatural start/stop effect on phones and desktops.
// Decorative characters and Markdown are removed, while 、。！？ act only as
// phrasing hints for speech synthesis (they are not spoken as words).
function speechInputText(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?=\D|$)/g, "$1年$2月$3日")
    .replace(/(?<!\d)(\d{1,2})\/(\d{1,2})(?!\d)/g, "$1月$2日")
    .replace(/(\d{1,2})[:：](\d{2})(?=\D|$)/g, "$1時$2分")
    .replace(/(\d{1,2})F\b/gi, "$1階")
    .replace(/[\u200c\u200d\ufe0e\ufe0f]/gu, " ");
}
// Plain words-only helper stays available for diagnostics and fallback.
function textForSpeech(value) {
  return speechInputText(value)
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ").trim();
}
// A single long utterance naturally respects 、 and 。 without artificial
// setTimeout() delays. Very long replies are split only for device safety.
function naturalSpeechText(value) {
  const input = speechInputText(value)
    .replace(/(?<=[=*_{}|\\])[!?！？](?=[=*_{}|\\])/gu, "");
  const japanese = /[\u3040-\u30ff\u3400-\u9fff]/u.test(input);
  let text = input
    .replace(/(\d+)[.．](\d+)/gu, (_, a, b) => japanese ? `${a}点${b}` : `${a} point ${b}`)
    .replace(/\r\n?/g, "\n")
    .replace(/[\n]+/g, japanese ? "、 " : ", ")
    .replace(/[;；:：]/gu, japanese ? "、" : ",")
    .replace(/[，,]/gu, japanese ? "、" : ",")
    .replace(/([。！？])\s*、/gu, "$1 ") // Avoid a second pause after an already finished Japanese sentence
    .replace(/[．.]/gu, japanese ? "。" : ".")
    .replace(/[!！]/gu, japanese ? "！" : "!")
    .replace(/[?？]/gu, japanese ? "？" : "?")
    .replace(/[^\p{L}\p{M}\p{N}\s、。！？,.!?]/gu, " ")
    .replace(/\s+([、。！？,.!?])/gu, "$1")
    .replace(/([、。！？,.!?])\1{1,}/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
  // Avoid silent fragments that consist of separators alone.
  if (!/[\p{L}\p{N}]/u.test(text)) text = "";
  return text;
}
function speechSegments(value) {
  const text = naturalSpeechText(value);
  if (!text) return [];
  const MAX_SPEECH_CHARS = 245;
  const pieces = text.match(/[^。！？.!?]+[。！？.!?]*\s*/gu) || [text];
  const chunks = [];
  let current = "";
  function push() {
    if (current.trim()) chunks.push({text:current.trim(), pause:0});
    current = "";
  }
  for (const sentence of pieces) {
    if (current && current.length + sentence.length > MAX_SPEECH_CHARS) push();
    if (sentence.length <= MAX_SPEECH_CHARS) {
      current += sentence;
      continue;
    }
    // A rare oversized sentence: split at natural clause/space boundaries.
    const clauses = sentence.match(/[^、,]+[、,]?\s*/gu) || [sentence];
    for (const clause of clauses) {
      if (current && current.length + clause.length > MAX_SPEECH_CHARS) push();
      if (clause.length <= MAX_SPEECH_CHARS) { current += clause; continue; }
      // Absolute fallback if a single token runs far beyond engine limits.
      for (let i = 0; i < clause.length; i += MAX_SPEECH_CHARS) {
        if (current) push();
        current = clause.slice(i, i + MAX_SPEECH_CHARS);
      }
    }
  }
  push();
  return chunks;
}
// Small session token prevents previous timed fragments resuming after mute,
// microphone activation, screen changes, or another message.
let replySpeechVersion = 0;
function stopReplySpeech() {
  replySpeechVersion++;
  window.speechSynthesis?.cancel();
}
function speakAnswer(text, languageHint = "") {
  if (!soundEnabled || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  stopReplySpeech();
  const chunks = speechSegments(text);
  if (!chunks.length) return;
  const synth = window.speechSynthesis;
  const textOnly = chunks.map(c => c.text).join(" ");
  const written = detectWrittenLanguage(textOnly);
  let locale = languageHint || written || "en-US";
  if (/[\u0980-\u09ff]/u.test(textOnly) && !locale.startsWith("bn")) locale = "bn-BD";
  else if (/[\u1000-\u109f]/u.test(textOnly)) locale = "my-MM";
  else if (/[\u1100-\u11ff\uac00-\ud7af]/u.test(textOnly)) locale = "ko-KR";
  else if (/[\u0900-\u097f]/u.test(textOnly) && !/^(hi|ne|mr)/i.test(locale)) locale = "hi-IN";
  else if (/[\u3040-\u30ff]/u.test(textOnly)) locale = "ja-JP";
  const isJapanese = locale.toLowerCase().startsWith("ja");
  const voices = synth.getVoices();
  const voice = isJapanese ? getPinnedJapaneseVoice() : pickReplyVoice(voices, locale);
  if (!voice && voices.length) {
    console.warn("No matching reply voice installed for", locale);
    voiceMessage("🔇 この端末には回答言語の音声がありません。端末の音声を追加してください。");
    return;
  }
  const session = replySpeechVersion;
  let index = 0;
  function next() {
    if (session !== replySpeechVersion || !soundEnabled || index >= chunks.length) return;
    const chunk = chunks[index++];
    const phrase = isJapanese ? chunk.text
      .replace(/学園祭\s*(?:AI|ＡＩ)/gi, "がくえんさい エーアイ")
      .replace(/学園祭/g, "がくえんさい") : chunk.text;
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = locale;
    utterance.rate = isJapanese ? JAPANESE_VOICE_RATE : 0.96;
    utterance.pitch = isJapanese ? JAPANESE_VOICE_PITCH : 1.0;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (session !== replySpeechVersion) return;
      next(); // No extra pause; synthesis already respects punctuation.
    };
    utterance.onerror = (event) => {
      if (session !== replySpeechVersion) return;
      if (event.error !== "interrupted" && event.error !== "canceled") console.info("[Voice] Reply TTS:", event.error);
    };
    synth.speak(utterance);
  }
  next();
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
      stopReplySpeech();
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


// ---------- WELCOME VOICE: AUTO WHEN ALLOWED, ONE-TAP OTHERWISE ----------
// IMPORTANT: browsers may prohibit audible autoplay without user interaction.
// Never claim to bypass that policy. Instead offer a reliable first-tap action.
const welcomeVoiceButton = document.getElementById("welcomeVoiceButton");
const welcomeRobot = document.getElementById("welcomeRobot");
// Pointer movement adds a small eye-glow shift; no camera or face tracking.
if (welcomeRobot) {
  welcomeRobot.addEventListener("pointermove", (event) => {
    const r = welcomeRobot.getBoundingClientRect();
    welcomeRobot.style.setProperty("--eye-shift-x", `${Math.max(-4, Math.min(4, ((event.clientX-r.left)/r.width-.5)*8))}px`);
    welcomeRobot.style.setProperty("--eye-shift-y", `${Math.max(-3, Math.min(3, ((event.clientY-r.top)/r.height-.5)*6))}px`);
  });
  welcomeRobot.addEventListener("pointerleave", () => {
    welcomeRobot.style.setProperty("--eye-shift-x", "0px");
    welcomeRobot.style.setProperty("--eye-shift-y", "0px");
  });
}
const welcomeVoiceHint = document.getElementById("welcomeVoiceHint");
console.info("[TTC Voice Version] welcome-autoplay-gesture-v4");
const WELCOME_SPEECH = "こんにちは！　東京テクニカルカレッジのがくえんさいへようこそ！　" +
  "私は、がくえんさいエーアイです。　スマートフォンでもパソコンでも使えます。　" +
  "ゲーム、フード、展示、教室やフロアの場所をチャットでご案内します。　" +
  "文字やマイクで質問でき、ローマ字入力と音声での回答にも対応しています。　" +
  "チャットを始めるボタンから、どうぞ！";

const WELCOME_SPEECH_REPEAT = WELCOME_SPEECH.replace(/^こんにちは！/, "");
let welcomeCompletedCycles = 0;
const canSpeakWelcome = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let welcomeMuted = false;
let welcomeUtterance = null;
let welcomeRepeatTimer = null;
let welcomeStartTimer = null;
let welcomeSpeechSession = 0;
let welcomeUnlocked = false;
let welcomePendingGesture = false;
let welcomeStarted = false;
let welcomeLastGestureAt = 0;

function isWelcomeVisible() {
  return !document.hidden && !document.getElementById("intro").hidden &&
    !document.getElementById("chat").classList.contains("active");
}
function welcomeStatus(message) {
  if (welcomeVoiceHint) welcomeVoiceHint.textContent = message;
}
function updateWelcomeButton() {
  if (!welcomeVoiceButton) return;
  const waiting = !welcomeMuted && welcomePendingGesture && !welcomeStarted;
  welcomeVoiceButton.textContent = welcomeMuted ? "🔇" : waiting ? "▶" : "🔊";
  const description = welcomeMuted ? "音声をオンにする" : waiting ? "音声ガイドを再生する" : "音声をミュート";
  welcomeVoiceButton.setAttribute("aria-pressed", String(welcomeMuted));
  welcomeVoiceButton.setAttribute("aria-label", description);
  welcomeVoiceButton.title = description;
  document.getElementById("intro")?.classList.toggle("voice-needs-gesture", waiting);
}
function requestWelcomeGesture(message = "🔊 音声ガイドを聞くには画面をタップしてください。") {
  if (!isWelcomeVisible() || welcomeMuted) return;
  welcomePendingGesture = true;
  welcomeStatus(message);
  updateWelcomeButton();
}
function stopWelcomeSpeech() {
  welcomeSpeechSession++;
  clearTimeout(welcomeRepeatTimer);
  clearTimeout(welcomeStartTimer);
  welcomeRepeatTimer = null;
  welcomeStartTimer = null;
  welcomeUtterance = null; // invalidate callbacks before cancel
  welcomeStarted = false;
  welcomeRobot?.classList.remove("is-speaking");
  if (canSpeakWelcome) window.speechSynthesis.cancel();
}
function repeatWelcome() {
  if (!welcomeMuted && isWelcomeVisible()) {
    clearTimeout(welcomeRepeatTimer);
    welcomeRepeatTimer = setTimeout(() => playWelcomeSpeech(), 1200);
  }
}
function playWelcomeSpeech(fromGesture = false) {
  if (!canSpeakWelcome || welcomeMuted || !isWelcomeVisible()) return;
  stopWelcomeSpeech();
  welcomePendingGesture = false;
  updateWelcomeButton();

  const synth = window.speechSynthesis;
  const sections = speechSegments(welcomeCompletedCycles ? WELCOME_SPEECH_REPEAT : WELCOME_SPEECH);
  if (!sections.length) return;
  const session = welcomeSpeechSession;
  const jaVoice = getPinnedJapaneseVoice();
  let index = 0;
  function playNextSection() {
    if (session !== welcomeSpeechSession || !isWelcomeVisible() || welcomeMuted) return;
    if (index >= sections.length) {
      welcomeUtterance = null;
      welcomeStarted = false;
      welcomeRobot?.classList.remove("is-speaking");
      welcomeCompletedCycles += 1;
      repeatWelcome();
      return;
    }
    const chunk = sections[index++];
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    welcomeUtterance = utterance;
    utterance.lang = "ja-JP";
    utterance.rate = WELCOME_VOICE_RATE;
    utterance.pitch = JAPANESE_VOICE_PITCH;
    utterance.volume = 1;
    if (jaVoice) utterance.voice = jaVoice;
    utterance.onstart = () => {
      if (session !== welcomeSpeechSession || welcomeUtterance !== utterance) return;
      welcomeStarted = true;
      welcomeRobot?.classList.add("is-speaking");
      welcomePendingGesture = false;
      clearTimeout(welcomeStartTimer);
      welcomeStatus("音声ガイドを再生しています。🔊");
      updateWelcomeButton();
    };
    utterance.onend = () => {
      if (session !== welcomeSpeechSession || welcomeUtterance !== utterance) return;
      playNextSection(); // Continue without an additional artificial gap.
    };
    utterance.onerror = (event) => {
      if (session !== welcomeSpeechSession || welcomeUtterance !== utterance) return;
      clearTimeout(welcomeStartTimer);
      if (event.error === "interrupted" || event.error === "canceled") return;
      welcomeUtterance = null;
      welcomeStarted = false;
      welcomeRobot?.classList.remove("is-speaking");
      console.info("[TTC Welcome Voice] Speech unavailable:", event.error);
      requestWelcomeGesture();
    };
    try {
      if (synth.paused) synth.resume();
      synth.speak(utterance);
      // Autoplay can be blocked: allow first-tap fallback on Safari.
      if (index === 1) {
        welcomeStartTimer = setTimeout(() => {
          if (session === welcomeSpeechSession && welcomeUtterance === utterance && !welcomeStarted) requestWelcomeGesture();
        }, fromGesture ? 2300 : 1400);
      }
    } catch (error) {
      if (session !== welcomeSpeechSession) return;
      welcomeUtterance = null;
      requestWelcomeGesture();
    }
  }
  playNextSection();
}
function activateWelcomeFromGesture(event) {
  if (!canSpeakWelcome || welcomeMuted || !isWelcomeVisible() || welcomeStarted) return;
  if (event?.target?.closest?.("#welcomeVoiceButton, #startButton")) return;
  // pointerdown + touchend + click may all fire for the same tap.
  const now = performance.now();
  if (now - welcomeLastGestureAt < 700) return;
  welcomeLastGestureAt = now;
  welcomeUnlocked = true;
  playWelcomeSpeech(true); // synchronous in a real interaction
}
if (welcomeVoiceButton) {
  updateWelcomeButton();
  if (!canSpeakWelcome) {
    welcomeVoiceButton.disabled = true;
    welcomeStatus("このブラウザーは音声読み上げに対応していません。");
  } else {
    welcomeVoiceButton.addEventListener("click", () => {
      if (welcomeMuted) {
        welcomeMuted = false;
        welcomeUnlocked = true;
        playWelcomeSpeech(true);
      } else if (!welcomeStarted) {
        // First tap means PLAY, even if autoplay failure hasn't fired yet.
        // Do not accidentally mute before any welcome sound has played.
        welcomeUnlocked = true;
        playWelcomeSpeech(true);
      } else {
        welcomeMuted = true;
        stopWelcomeSpeech();
        welcomeStatus("音声はミュートされています。");
      }
      updateWelcomeButton();
    });
    const intro = document.getElementById("intro");
    intro.addEventListener("pointerdown", activateWelcomeFromGesture);
    intro.addEventListener("touchend", activateWelcomeFromGesture, {passive: true});
    intro.addEventListener("click", activateWelcomeFromGesture);
    intro.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") activateWelcomeFromGesture(event);
    });
    window.addEventListener("load", () => {
      if (isWelcomeVisible()) playWelcomeSpeech(); // best-effort browser autoplay
    }, {once: true});
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopWelcomeSpeech();
      else if (!welcomeMuted && isWelcomeVisible()) {
        playWelcomeSpeech(); // try again on tab return; browser may require a tap
      }
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted && !welcomeMuted && isWelcomeVisible()) playWelcomeSpeech();
    });
  }
}

window.TTC_JAPANESE_TEXT_UTILS = Object.freeze({prepareTypedQuestion, textForSpeech, speechSegments, cleanVisibleChatText});

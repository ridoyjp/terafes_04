import { SCHOOL_DATA } from "./school-data.js";
import { FESTIVAL_DATA } from "./festival-data.js";


/*
  TTC 学園祭 Chat Bot 2026
  Cloudflare Worker + Google Gemini
  API key stays in Cloudflare Secrets.
*/

const DEFAULT_ORIGIN = "https://ridoyjp.github.io";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE = 1200;

const SYSTEM_TEXT = `
あなたは「TTC 学園祭 2026」の親切な多言語AIアシスタントです。学校案内だけのボットではありません。

【回答ルール】
- 学校以外の幅広い質問にも答えてください（知識、学習、数学、コード、翻訳、日常の質問など）。
- ユーザーの最新の質問で使われた言語と同じ言語で返答してください。日本語は日本語、বাংলা は বাংলা、English は English、ほかの言語も可能な範囲で対応してください。
- 入力が音声認識経由で、明示的な responseLanguage が渡されている場合、その言語を優先してください。
- 言語が不明なら質問の文脈または直近のやり取りに合わせてください。
- すべての言語・音声に完全対応していると断言しないでください。
- 学園祭以外にも、プログラミング、勉強、翻訳、
  一般知識などの質問に答えてください。
- わかりやすく、親切に説明してください。
- 事実が不明な場合は推測で断定しないでください。

【学園祭の情報源ポリシー】
学園祭2026については、システムに付与される【2026年 学園祭・先生承認データ】だけを最新の確定情報と見なしてください。
その情報にない開催日時、価格、教室番号、出店、出演者、トイレ場所等を作らないでください。
「情報未確認」と伝え、学校の公式案内・担当スタッフに確認するよう案内してください。
参考として2025年の行事について聞かれた時だけ、【2025年の参考実績】を使い、2026年と取り違えないでください。
未確認の情報を肯定的に断言しないでください。

回答は基本的に簡潔にしてください。
東京テクニカルカレッジについては追加された学校確認資料を優先し、学園祭の未確認事項を作り話で埋めないでください。
公式情報は更新されることがあります。重要な場合は学校公式サイトでの再確認を案内してください。
`;

// Romanized Japanese typed with a Latin keyboard should be answered in Japanese.
function isJapaneseRomaji(text) {
  const q = String(text || "").toLowerCase().trim().replace(/[?!.,]/g, " ").replace(/\s+/g, " ");
  if (!q || /[^\x00-\x7F]/.test(q)) return false;
  const phrases = /\b(?:desu|desuka|desu ka|masu|masuka|masu ka|arimasu|arimasuka|kudasai|onegaishimasu|oshiete|shiritai|dare|doko|itsu|nanji|nani|donna|douyatte|ikikata|kouchou|kocho|fukukouchou|sensei|gakka|gakuen|gakusai|gakuensai|nyuugaku|jugyouryou|ryuugakusei|shushoku|shikaku|jyuusho|juusho|denwa|senmon|wa dare|wa doko|wa nani|ni tsuite|no koto|tte nani)\b/i;
  return phrases.test(q) || (/\b(?:ttc|tokyo technical college|tokyo tekunikaru karejji|higashi nakano)\b/i.test(q) && /\b(?:wa|no|ni|de|ga|wo|o)\b/i.test(q));
}

function getRelevantSchoolData(message, history) {
  const query = [message, ...history.filter(x=>x?.role==='user').slice(-1).map(x=>x.text||'')].join(' ').toLowerCase();
  const schoolWords = /ttc|kouchou|kocho|sensei|gakka|gakuen|gakusai|gakuensai|nyuugaku|jugyouryou|ryuugakusei|shushoku|shikaku|juusho|jyuusho|denwa|higashi nakano|tokyo technical|学校|専門|ttc|テクニカル|school|college|学園|入学|学費|留学生|奨学|就職|資格|オープンキャンパス|建築|インテリア|バイオ|情報処理|キャンパス|東中野|中野|住所|アクセス|施設|学科|学園祭|祭り|文化祭|ステージ|フード|屋台|ブース|会場|トイレ|স্কুল|কলেজ|উৎসব|ভর্তি|ফি|ক্যাম্পাস|school festival|festival|admission|tuition|course|department/i;
  if (!schoolWords.test(query)) return '';
  const scored = SCHOOL_DATA.entries.map(e=>({e,score:e.keywords.reduce((a,k)=>a+(query.includes(k.toLowerCase())? (k.length>2?3:1):0),0)}));
  scored.sort((a,b)=>b.score-a.score);
  const selected = scored.filter(x=>x.score>0).slice(0,6).map(x=>x.e);
  // General romanized school questions should still receive school overview.
  if (/\b(ttc|tokyo technical|tokyo tekunikaru)\b/i.test(query) && !selected.length) {
    const intro = SCHOOL_DATA.entries.find(e => e.topic === '概要・歴史');
    if (intro) selected.push(intro);
  }
  // Always include the top-level school contact/overview for broad "school" questions.
  if (!selected.length || /^(学校|学校について|school|ttc|কলেজ|স্কুল|東京テクニカルカレッジ)/i.test(message.trim())) {
    for (const topic of ['概要・歴史','所在地・アクセス','電話・相談窓口']) {
      const e=SCHOOL_DATA.entries.find(e=>e.topic===topic);
      if(e && !selected.includes(e)) selected.push(e);
    }
  }
  return '【学校確認資料（2026-10-19時点）】\n'+selected.slice(0,9).map(e=>`■ ${e.topic}\n${e.text}\n出典: ${e.source||'未提供（学園祭担当教員に確認）'}`).join('\n\n');
}

// Teacher-reviewed 2026 festival information. Draft records must NEVER be
// presented to visitors as confirmed facts. Generated from the teacher JSON.
function getApprovedFestivalContext(message) {
  const q = String(message || "").toLowerCase();
  const festivalKeywords = /学園祭|文化祭|フェス|祭り|gakuensai|festival|matsuri|フード|屋台|ゲーム|ステージ|会場|トイレ|タイムテーブル|event|stage|food|game|map|fest|উৎসব|মেলা/i;
  if (!festivalKeywords.test(q)) return "";
  const approved = FESTIVAL_DATA.status === "APPROVED" &&
    Boolean(FESTIVAL_DATA.approved_by && FESTIVAL_DATA.last_verified);
  const official2026 = approved
    ? JSON.stringify(FESTIVAL_DATA, null, 2).slice(0, 9000)
    : "【2026年 学園祭・先生承認データ】未提供・未承認。2026年の詳細は確定情報として回答しない。";
  const historical = `【2025年の参考実績（2026年の予定ではありません）】
2025年10月25日にTTC Festival 2025を実施。学校公式告知では学生企画の体験、作品展示、出店などを紹介しています。
出典: https://tec.ttc.ac.jp/news/nid14607/（2025.10.01掲載）。
2026年の出店や日時を2025年から推測してはいけません。`;
  return official2026 + "\n\n" + historical;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    const allowedOrigins = [
      DEFAULT_ORIGIN,
      ...String(env.EXTRA_ALLOWED_ORIGINS || "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean)
    ];

    const allowed = allowedOrigins.includes(origin);

    const headers = corsHeaders(
      allowed ? origin : DEFAULT_ORIGIN
    );

    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!allowed) {
        return json({ error: "Origin not allowed" }, 403, headers);
      }

      return new Response(null, {
        status: 204,
        headers
      });
    }

    // Multilingual speech-to-text: audio is processed in memory, not stored.
    if (url.pathname === "/transcribe") {
      if (!allowed) return json({ error: "Origin not allowed" }, 403, headers);
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
      if (!env.GEMINI_API_KEY) return json({ error: "Gemini API Key is not configured" }, 503, headers);
      // Base64 audio payload max ~2.1 MB; request body limit includes JSON overhead.
      if (Number(request.headers.get("Content-Length") || 0) > 3_000_000) {
        return json({ error: "Recording too large" }, 413, headers);
      }
      let voiceData;
      try {
        const body = await request.text();
        if (body.length > 3_000_000) return json({ error: "Recording too large" }, 413, headers);
        voiceData = JSON.parse(body);
      } catch { return json({ error: "Invalid audio request" }, 400, headers); }
      const audio = voiceData?.audio;
      const mimeType = voiceData?.mimeType;
      const allowedTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"];
      const cleanedType = typeof mimeType === "string" ? mimeType.split(";")[0].toLowerCase() : "";
      if (!allowedTypes.includes(cleanedType) || typeof audio !== "string" || audio.length < 100 || audio.length > 2_900_000 || !/^[a-zA-Z0-9+/=]+$/.test(audio)) {
        return json({ error: "Invalid audio data or audio type" }, 400, headers);
      }
      const model = String(env.GEMINI_AUDIO_MODEL || "gemini-3.8-flash").trim();
      const japaneseOnly = voiceData?.language === "ja-JP";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [
                { text: japaneseOnly
                    ? "Transcribe this Japanese speech in standard Japanese writing (kanji, hiragana and katakana). Never translate or answer. Return ONLY the spoken Japanese words. If silent or unintelligible return an empty response."
                    : "Transcribe the spoken audio exactly in the ORIGINAL spoken language and ORIGINAL writing system. Automatically identify language. Do not translate or answer the speech. Return only the transcript, without explanations or labels. If silent/unintelligible, return an empty response." },
                { inlineData: { mimeType: cleanedType, data: audio } }
              ] }],
              generationConfig: { temperature: 0, maxOutputTokens: 1400 }
            }),
            signal: controller.signal
          }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.error("Gemini transcription error", { model, status: response.status, providerStatus: result?.error?.status, providerMessage: String(result?.error?.message || "").slice(0, 250) });
          return json({ error: response.status === 429 ? "Voice AI usage limit reached" : "Voice transcription service unavailable" }, response.status === 429 ? 429 : 502, headers);
        }
        const transcript = (result.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
        return json({ transcript: transcript.slice(0, 1500) }, 200, headers);
      } catch (error) {
        console.error("Voice transcription request failed", error?.name);
        return json({ error: "Voice recognition timed out" }, 504, headers);
      } finally { clearTimeout(timer); }
    }

    if (url.pathname !== "/chat") {
      return json({ error: "Not found" }, 404, headers);
    }

    if (!allowed) {
      return json({ error: "Origin not allowed" }, 403, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (
      Number(request.headers.get("Content-Length") || 0) > 14000
    ) {
      return json({ error: "Request too large" }, 413, headers);
    }

    let data;

    try {
      data = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, headers);
    }

    const message =
      typeof data?.message === "string"
        ? data.message.trim()
        : "";

    if (!message || message.length > MAX_MESSAGE) {
      return json({
        error: "Message must contain 1-1200 characters"
      }, 400, headers);
    }

    if (!env.GEMINI_API_KEY) {
      return json({
        error: "Gemini API Key is not configured"
      }, 503, headers);
    }

    const model = String(
      env.GEMINI_MODEL || DEFAULT_MODEL
    ).trim();

    const history = Array.isArray(data.history)
      ? data.history.slice(-10)
      : [];

    const allowedLocales = new Set(["bn-BD","en-US","ja-JP","hi-IN","ur-PK","ar-SA","es-ES","fr-FR","de-DE","pt-BR","zh-CN","ko-KR","id-ID","th-TH","vi-VN","si-LK"]);
    const responseLanguage = typeof data.responseLanguage === "string" && allowedLocales.has(data.responseLanguage)
      ? data.responseLanguage : "";
    const LANGUAGE_NAMES = {
      "bn-BD": "Bengali (বাংলা)", "en-US": "English", "ja-JP": "Japanese (日本語)",
      "hi-IN": "Hindi", "ur-PK": "Urdu", "ar-SA": "Arabic", "es-ES": "Spanish",
      "fr-FR": "French", "de-DE": "German", "pt-BR": "Portuguese",
      "zh-CN": "Chinese", "ko-KR": "Korean", "id-ID": "Indonesian",
      "th-TH": "Thai", "vi-VN": "Vietnamese", "si-LK": "Sinhala"
    };
    const romajiJapanese = isJapaneseRomaji(message);
    const effectiveResponseLanguage = romajiJapanese ? "ja-JP" : responseLanguage;
    // When official 2026 data is missing, answer common exact festival-detail
    // questions deterministically instead of asking a model to guess dates,
    // prices, floor numbers or food menus. Also saves a Gemini request.
    const approved2026 = FESTIVAL_DATA.status === "APPROVED" &&
      Boolean(FESTIVAL_DATA.approved_by && FESTIVAL_DATA.last_verified);
    const refersTo2025 = /2025|昨年|去年|last year|previous year|গত বছর/i.test(message);
    const isFestivalSpecific = /学園祭|文化祭|がくえんさい|gakuensai|gakusai|matsuri|学校祭|フェスティバル|school festival|ttc festival|উৎসব|মেলা|festival/i.test(message);
    const isFestivalQuickTopic = /^(おすすめは何ですか|食べ物はどこですか|ゲームはありますか|ステージについて教えて|会場の場所を教えて|開催時間を教えて|トイレはどこですか)/.test(message);
    const seeksSpecifics = /いつ|日時|日付|何時|時間|値段|料金|価格|いくら|どこ|場所|何階|教室|マップ|地図|予定|出店|屋台|食品|食べ物|フード|ゲーム|ステージ|会場|内容|スケジュール|タイムテーブル|おすすめ|トイレ|受付|日程|start|when|where|date|time|price|food|stall|map|game|stage|schedule|cost|location|event|কবে|কোথায়|দাম|সময়|খাবার/i.test(message);
    if (!approved2026 && !refersTo2025 && ((isFestivalSpecific && seeksSpecifics) || isFestivalQuickTopic)) {
      const lang = effectiveResponseLanguage || (/[\u0980-\u09ff]/u.test(message) ? "bn-BD" : /[\u3040-\u30ff\u3400-\u9fff]/u.test(message) ? "ja-JP" : "en-US");
      const reply = lang === "bn-BD"
        ? "২০২৬ সালের TTC 学園祭-এর নির্দিষ্ট সময়, খাবারের স্টল, দাম ও কক্ষের তথ্য এখনও স্কুল থেকে অনুমোদিত নয়। অনুগ্রহ করে স্কুলের অফিসিয়াল ঘোষণা বা আয়োজক শিক্ষকের সঙ্গে নিশ্চিত করুন।"
        : lang === "en-US"
          ? "The 2026 TTC Festival schedule, food stalls, prices and room details have not yet been confirmed by the school. Please check the school's official announcements or festival staff."
          : "2026年の学園祭の開催日時、出店、価格、教室などの詳細は、現在学校から確認が取れていません。学校の公式案内または担当の先生にご確認ください。";
      return json({ reply, informationStatus: "UNVERIFIED_2026" }, 200, headers);
    }
    const targetLanguage = LANGUAGE_NAMES[effectiveResponseLanguage] || "the language of the latest user message";
    const languageRule = `
CRITICAL OUTPUT LANGUAGE POLICY:
If the latest user question is Japanese written in Romaji (Latin-letter transcription), answer in natural Japanese script (漢字・ひらがな・カタカナ), NOT English or Romaji.
Examples: "TTC no kouchou wa dare desu ka?" -> Japanese; "gakkou wa doko desu ka" -> Japanese.
Plain English questions, such as "What is the school address?", must still receive English answers.
Respond ONLY in ${targetLanguage}. This applies to EVERY sentence, introduction,
summary, closing sentence, follow-up question, and disclaimer.
Never append Japanese greetings or festival advertising when the question is in Bengali/English/etc.
If school source notes are in Japanese, translate or transliterate them into ${targetLanguage}.
Keep proper nouns in original form ONLY if necessary for an exact address, school name, or official title.
Do not add another language unless the user explicitly requests translation or bilingual output.
If the user writes in Bengali, respond exclusively in natural Bengali script (বাংলা), not Japanese.
If the user writes in English, respond exclusively in English, not Japanese.
Your final answer should directly address the latest question; no unrelated festival promotion.
`;

    const contents = [];

    for (const entry of history) {
      if (
        !entry ||
        !["user", "model"].includes(entry.role) ||
        typeof entry.text !== "string"
      ) {
        continue;
      }

      const text = entry.text
        .slice(0, entry.role === "user" ? 1200 : 2500)
        .trim();

      if (text) {
        contents.push({
          role: entry.role,
          parts: [{ text }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      const endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(model) +
        ":generateContent";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_TEXT + languageRule + "\n\n" + getApprovedFestivalContext(message) + "\n\n" + getRelevantSchoolData(message, history) }]
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1200
          }
        }),
        signal: controller.signal
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Gemini API Error:", {
          model,
          httpStatus: response.status,
          providerStatus: result?.error?.status,
          providerMessage: String(
            result?.error?.message || ""
          ).slice(0, 500)
        });

        if (response.status === 429) {
          return json({
            error: "AIの利用上限に達しました。"
          }, 429, headers);
        }

        if (response.status === 404) {
          return json({
            error: "Geminiモデルが見つかりません。Workerログをご確認ください。"
          }, 502, headers);
        }

        return json({
          error: "AIサービスに接続できませんでした。"
        }, 502, headers);
      }

      const reply = (
        result.candidates?.[0]?.content?.parts || []
      )
        .map(part =>
          typeof part.text === "string" ? part.text : ""
        )
        .join("")
        .trim();

      if (!reply) {
        return json({
          error: "AIから回答を取得できませんでした。"
        }, 502, headers);
      }

      return json({
        reply: reply.slice(0, 5000)
      }, 200, headers);

    } catch (error) {
      console.error("Gemini request failed:", error?.name);

      return json({
        error: "AIへの接続がタイムアウトしました。"
      }, 504, headers);

    } finally {
      clearTimeout(timeout);
    }
  }
};

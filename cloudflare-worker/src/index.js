import { SCHOOL_DATA } from "./school-data.js";


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

【確認済みの学園祭情報】
フード、ゲーム・体験、ステージ、会場ガイドの
カテゴリーがあります。

開催日時、価格、場所、出演者などの詳細は未提供です。
不明な学園祭情報は学校の公式案内またはスタッフに
確認するよう案内してください。

回答は基本的に簡潔にしてください。
東京テクニカルカレッジについては追加された学校確認資料を優先し、学園祭の未確認事項を作り話で埋めないでください。
公式情報は更新されることがあります。重要な場合は学校公式サイトでの再確認を案内してください。
`;

function getRelevantSchoolData(message, history) {
  const query = [message, ...history.filter(x=>x?.role==='user').slice(-1).map(x=>x.text||'')].join(' ').toLowerCase();
  const schoolWords = /学校|専門|ttc|テクニカル|school|college|学園|入学|学費|留学生|奨学|就職|資格|オープンキャンパス|建築|インテリア|バイオ|情報処理|キャンパス|東中野|中野|住所|アクセス|施設|学科|学園祭|祭り|文化祭|ステージ|フード|屋台|ブース|会場|トイレ|স্কুল|কলেজ|উৎসব|ভর্তি|ফি|ক্যাম্পাস|school festival|festival|admission|tuition|course|department/i;
  if (!schoolWords.test(query)) return '';
  const scored = SCHOOL_DATA.entries.map(e=>({e,score:e.keywords.reduce((a,k)=>a+(query.includes(k.toLowerCase())? (k.length>2?3:1):0),0)}));
  scored.sort((a,b)=>b.score-a.score);
  const selected = scored.filter(x=>x.score>0).slice(0,6).map(x=>x.e);
  // Always include the top-level school contact/overview for broad "school" questions.
  if (!selected.length || /^(学校|学校について|school|ttc|কলেজ|স্কুল|東京テクニカルカレッジ)/i.test(message.trim())) {
    for (const topic of ['概要・歴史','所在地・アクセス','電話・相談窓口']) {
      const e=SCHOOL_DATA.entries.find(e=>e.topic===topic);
      if(e && !selected.includes(e)) selected.push(e);
    }
  }
  return '【学校確認資料（2026-10-19時点）】\n'+selected.slice(0,9).map(e=>`■ ${e.topic}\n${e.text}\n出典: ${e.source||'未提供（学園祭担当教員に確認）'}`).join('\n\n');
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
    const languageRule = responseLanguage
      ? `\n【今回の回答言語】${responseLanguage}。可能な限り、この言語で自然に返答してください。`
      : "\n【今回の回答言語】最新のユーザー質問と同じ言語で返答してください。";

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
            parts: [{ text: SYSTEM_TEXT + languageRule + "\n\n" + getRelevantSchoolData(message, history) }]
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


/*
  TTC 学園祭 Chat Bot 2026
  Cloudflare Worker + Google Gemini
  API key stays in Cloudflare Secrets.
*/

const DEFAULT_ORIGIN = "https://ridoyjp.github.io";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE = 1200;

const SYSTEM_TEXT = `
あなたは「TTC 学園祭 2026」の親切なAIチャットアシスタントです。

【回答ルール】
- 日本語で質問されたら日本語で答えてください。
- 英語やベンガル語にも対応してください。
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
`;

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
            parts: [{ text: SYSTEM_TEXT }]
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

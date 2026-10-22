# TTC 学園祭 2026 AIチャットボット

**Main target:** Japanese-speaking visitors at Tokyo Technical College school festival.

Features: Japanese-first UI, natural Japanese text & Japanese Romaji answers, Japanese browser voice input with Gemini audio fallback, localized AI reply voice, accessible mute button and looping Welcome Voice (browser autoplay limitations apply), festival teacher-reviewed data integration.

**Run tests:** `node tools/smoke-test.mjs` and `node tools/sync-festival-data.cjs`.

**Install:** See [INSTALL_JP_BN.md](INSTALL_JP_BN.md). GitHub Pages deploy and Cloudflare Worker deploy are **separate**. Do not push API keys. School-approved 2026 festival data is currently a **DRAFT**, not real event confirmation.

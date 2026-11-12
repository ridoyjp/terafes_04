# TTC Festival Chatbot — General AI answers update

**Date:** 2026-11-12

## What this update does

- TTC festival questions about a school-provided 2026 event, floor or room still use the original XLSX data.
- TTC school questions about tuition, subjects, teachers and admission use curated school source context where relevant.
- Unrelated questions (Tokyo food, Bangladesh, programming, math, travel, translation, other schools, other festivals) now go directly to Gemini, without injecting TTC school facts or the 2026 floor guide.
- If the provider is unavailable or its daily quota is exhausted, a general AI reply cannot be guaranteed. The website is NOT a live web-search engine.
- Safety and accuracy depend on the model and the sources available; unknown recent facts may be uncertain.

## Local tests

```bat
cd /d "C:\terafes_04_fresh"
node tests\general-any-question-routing.test.mjs
node tests\school-general-routing-2026.test.mjs
node --test tests\backend-behavior.test.mjs
```

These tests mock Gemini, so they establish routing behavior, NOT live provider availability or factual accuracy.

## Publish

1. Copy the files from the Patch ZIP, preserving their relative folder paths.
2. Deploy front-end changes via GitHub Pages:

```bat
cd /d "C:\terafes_04_fresh"
git add -A
git commit -m "Allow general questions outside TTC and improve AI routing"
git push origin main
```

3. Deploy Cloudflare Worker code separately:

```bat
cd /d "C:\terafes_04_fresh\cloudflare-worker"
npx wrangler deploy
```

4. On the public HTTPS website, test **東京のおいしい食べ物は何ですか**, **What is 25 times 9?**, **情報処理科では何を学びますか**, and **501号室には何がありますか**. Only the last one should return the festival floor-guide data. The college subjects question should use TTC sources; other questions should go through Gemini.

## Important

`file://` local opening does not enable the live Gemini API. Keep `GEMINI_API_KEY` in Cloudflare secrets and do not commit credentials. The older UI tests for removed menus are not all updated in this change.

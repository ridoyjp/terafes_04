# TTC FESTIVAL 2026 — Full Project QA Review

**পরীক্ষার তারিখ:** 2026-11-12  
**পরীক্ষার উৎস:** `TTC_Festival_Single_View_Navigation_Full_Project.zip`  
**গুরুত্বপূর্ণ:** এটি Local Code, Chromium Simulation, Mock Voice/Network এবং স্কুলের Excel Data-ভিত্তিক QA। Live Gemini বা বাস্তব iPhone Safari / Android Microphone পরীক্ষা নয়।

## Verified Results

| Test Scope | Result | কী যাচাই করা হয়েছে |
|---|---:|---|
| Desktop/Mobile Chromium Interactions | 42/42 PASS | Desktop 1366px, Android-sized 393px, iPhone-sized Chromium 390px; Start, Back, Menu Open/Close, Quick Links, 34 Buttons, Chat Answer, Overflow, JS errors |
| AI/Voice Mock | 8/8 PASS | Chat POST format, Mock Reply, Speaker On/Off, Text Cleaner, SpeechRecognition initiation ও Auto-Send, no JS errors |
| Cloudflare Worker Security/Routes | 8/8 PASS | CORS allowed/blocked, wrong methods, unauthorized admin, missing API key, invalid path |
| Additional Excel UI Checks | 7/7 PASS | 34 activities, 21 entries, 9 floors, AI category, 5F & 501 room, single-view menu |
| Excel XLSX vs JSON | 60/60 non-empty cells match | সম্পূর্ণ A1:G13 তুলনা; JSON `source_sha256`-ও Excel file hash-এর সঙ্গে মিলে গেছে |
| Original Legacy Automated Test Suite | **21 PASS / 20 FAIL** | 41 test; অনেক Test পূর্বের Search Box, Floor Tabs, DOM ID ও CSS version-এর ওপর নির্ভর করছে |
| JS Syntax & ZIP Integrity | PASS | Node syntax এবং ZIP CRC |

## Core Findings

- Homepage original Festival logo ও SVG Game/Food/Map icons ঠিক আছে। Robot assets ও Text Input আছে।
- Start Now → Chat, Back → Home, 情報一覧 Open/Close, Menu Home Reset এবং অন্য Category-তে Switch করলে আগের তালিকা বন্ধ—Browser Simulation-এ কাজ করেছে।
- 34 activities ও 9 floor-এর তথ্য পাওয়া যাচ্ছে। 501号室-এর AI প্রদর্শনীসহ Excel-এর তথ্য Chat-এ দেখা গেছে।
- Chat bubble ও Speech text-cleaning routine অপ্রয়োজনীয় Symbol বাদ দেয়। Voice-এর প্রকৃত উচ্চারণ কোনো Real Device-এ শোনা হয়নি।
- Gemini Worker Model `gemini-3.5-flash-lite` Google API-এর বৈধ model ID; Voice transcription-এর configured/fallback endpoint আছে। Model availability **Live API response** দিয়ে যাচাই করা হয়নি।
- Cloudflare Worker-এ `GEMINI_API_KEY` server secret হিসেবে ব্যবহৃত হয়; Frontend config-এ API Key পাওয়া যায়নি।
- `file://` থেকে Local Chrome-এ UI দেখা গেলেও Cloudflare Worker CORS-এর কারণে Gemini API চলবে না; GitHub Pages HTTPS দরকার।

## Issues and Action Items

1. **পুরোনো Tests: 20 failures** — `tests/` ও `tools/`-এর কিছু Assertions এখন সরিয়ে ফেলা Search Box বা Old Floor Tabs খোঁজে; নতুন UI অনুযায়ী নতুন Tests বানাতে হবে। এগুলোর সবগুলো Live Bug নয়।
2. **Original README outdated** — Original `README.md`-এ `# Web_Portfolio` ছিল; এই QA-reviewed ZIP-এ Project-specific README দিয়ে ঠিক করা হয়েছে।
3. **Live test missing** — Real Cloudflare Production `/chat` + `/transcribe`, Gemini API quota/secret, Safari iOS TTS/STT, Android Mic permission এবং Autoplay অবশ্যই আলাদা পরীক্ষা করতে হবে।
4. **No real-device guarantee** — Chromium মোবাইল স্ক্রিন Simulation আসল Safari বা Android Hardware-এর সমতুল্য নয়।
5. **Source code unchanged** — Review হিসেবে `index.html`, `script.js`, `style.css`, Cloudflare Worker এবং Excel স্পর্শ করা হয়নি; শুধু Documentation যুক্ত/সংশোধন করা হয়েছে।

## Release Decision

**UI / Excel-backed guided menu: PASS in simulated browser.**  
**Production AI/Voice: NOT VERIFIED.**  
**Old suite: needs maintenance; do not mark ALL PASS.**

**Google Model Docs:** https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite

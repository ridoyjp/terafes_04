# TTC FESTIVAL 2026 — AI Chatbot Full QA Review

**পরীক্ষার তারিখ:** 2026-11-12  
**পরীক্ষিত Source ZIP:** `TTC_Festival_Professional_Logos_Only_Full.zip`  
**মূল কোড:** `Terafes_04/`  
**QA ধরন:** Static analysis + Chromium Browser emulation + simulated Voice/Network + Worker unit logic + XLSX comparison

## Summary

**শুধু Offline/Simulation পরীক্ষায় সফল। Live Production Quality নিশ্চিত নয়।**

| বিভাগ | ফলাফল | কী পরীক্ষা করা হয়েছে |
|---|---|---|
| JavaScript syntax | PASS | frontend, config, guide, admin এবং Worker modules |
| Browser interaction | **72/72 PASS** | Desktop Chromium 1440x900, Android Chrome-sized emulation 393x873, iPhone-sized Chromium emulation 390x844 |
| Worker API route / security | **8/8 PASS** | CORS preflight, reject unapproved origin, 501 room response, unknown schedule guard, max message, missing secret, blocked POST, admin auth |
| Voice simulation | **7/7 PASS** | Japanese TTS text, mute/unmute, synthetic microphone result, auto-send, no duplicate messages, back navigation |
| Existing unit suite | **21/41 PASS; 20 FAIL** | অধিকাংশ ব্যর্থতা আগের UI ও HTML version identifier-নির্ভর Test; এগুলো বাদ/পরিবর্তিত Quick Search ও পুরোনো buttons খুঁজছে |
| Existing old utility scripts | FAIL (outdated expectations) | `smoke-test`, `full-function-check`, `deep-function-check`, `responsive-design-test`, `final-professional-check` বর্তমান UI-এর সঙ্গে সামঞ্জস্যপূর্ণ নয় |
| XLSX data consistency | PASS | আপলোড করা Excel এবং Project-এর Excel SHA-256 hash এক; 9 floors, 21 records; frontend 34 activity buttons |
| Image files | PASS | 10টি Image/Animation file সফলভাবে decode; Browser emulation-এ 4/4 visible images loaded |
| Live Gemini + Worker | **NOT VERIFIED** | এই পরিবেশে live Worker DNS/network access সম্ভব হয়নি; browser request path mocked ছিল |
| Actual Safari/iPhone, Android microphone | **NOT VERIFIED** | প্রকৃত ডিভাইস ও speaker/microphone hardware এখানে পাওয়া যায়নি |

## Browser checks (72/72)

Desktop, Android-sized Chromium এবং iPhone-sized Chromium-এ প্রতিটির জন্য:
- Home Page খুলছে; ৩টি Professional SVG icon আছে।
- Home/Chat layout-এ horizontal overflow নেই।
- Chat Start ও Back navigation; Main Information menu open/close; পুনরায় খুললে ৫টি main button।
- Food category ২টি; ১F-এ কফি সম্পর্কে উত্তর আসে; school sheet-এ room number না থাকলে বানিয়ে বলে না।
- All category-তে একই পেজে ৩৪টি activity button; Next pagination নেই।
- Quick Game-এ ২৪টি game/experience tag-matched option; Floor-এ ৯টি।
- Chat API-তে POST request `.../chat` পাঠানোর UI path ঠিক আছে (Mock response)।
- Mobile Chat Input viewport-এর মধ্যে আছে।
- কোন uncaught browser JavaScript exception দেখা যায়নি।

**সীমাবদ্ধতা:** Browser navigation (`localhost`, `file://`) প্রশাসনিকভাবে ব্লক থাকায় HTML/CSS/JavaScript in-memory injection দিয়ে interaction পরীক্ষা হয়েছে। প্রকৃত deployment, caching, HTTP headers বা CDN যাচাই নয়। Android/iPhone are Chromium emulations — Safari/WebKit নয়।

## Voice checks (7/7 simulated)

- TTS input থেকে `! *** , = | _ { }`-এর মতো punctuation ও symbols বাদ যায়।
- Japanese speech locale `ja-JP` ও rate 0.88 ব্যবহার করে।
- Sound Toggle OFF থাকলে নতুন কথা বলে না, ON হলে আবার ডাকে।
- Mock microphone final transcript `501号室はどこですか` একবার auto-send করে, 5F তথ্য দেখায়।
- Voice input শেষে duplicate message হয়নি।

**অবশ্যই বাকি:** actual sound শুনে pronunciation, speaker volume, iPhone Safari microphone permission, iOS autoplay restriction, Android Chrome microphone, Gemini `/transcribe` বাস্তব audio upload, Japanese STT provider/network latency।

## API & Worker review

- Browser-এ API Key embed করা নেই; Cloudflare Worker Secret ব্যবহার করে।
- Production website's allowed Origin `https://ridoyjp.github.io`। `file://` থেকে সাধারণ Gemini chat ব্যবহার উপযুক্ত নয়।
- Local static XLSX guide reply API ছাড়াই কাজ করতে পারে।
- Unknown 2026 schedule/price data confidence guard আছে।
- CORS bad origin, invalid input, absent secret, admin guard – all covered by offline worker tests।
- Model names `gemini-3.5-flash-lite` (chat default) এবং `gemini-3.8-flash` (audio fallback) Google official docs-এ listed; তবে deployed Worker-এ ENV override কী সেটি দেখা হয়নি।
- **Live status, real provider model entitlement, API quota, rate limiter with actual Cloudflare services এবং live `/chat`/`transcribe` সফলতা যাচাই করা হয়নি।**

## Existing test failures — important

`node --test tests/*.test.mjs` -> 41 total, 21 pass, **20 fail**। Failing tests include quick-search IDs that were intentionally removed, old floor/category buttons, earlier asset and script version strings. These are test-maintenance failures *as observed*, not proof that today's UI is broken. Some old tests require rewriting to assert the new `festivalMainOptions`/`festivalSuggestionChoices` flow. The 72 targeted browser tests demonstrate that current UI behavior functions in emulation; they do not invalidate the old failures.

## Production release checklist

1. Open **https://ridoyjp.github.io/terafes_04/** in Windows Chrome, Android Chrome and iPhone Safari **over HTTPS**, not `C:\...\index.html`.
2. Open/close 情報一覧, choose 501号室, 405/407, Food, Game, Floor and confirm all menus and answers.
3. Ask a general AI question not in the XLSX; confirm **real** `/chat` HTTP 200 and successful Gemini reply in DevTools Network.
4. Test microphone permission, 501号室 speech recognition and auto-send on actual Android and iPhone.
5. Listen to speech and inspect punctuation-free Japanese reading; test sound ON/OFF, welcome replay, and after refresh.
6. Verify live Worker secrets, CORS, rate limit, provider errors and `/transcribe` without exposing keys.
7. Update stale 20 unit tests and outdated utility scripts before claiming automated suite 100% green.

**Release decision:** Prototype/UI-level QA looks good. **Full production sign-off is blocked by actual-device Safari/Mic/TTS and live Gemini/Worker verification, plus stale test scripts.**

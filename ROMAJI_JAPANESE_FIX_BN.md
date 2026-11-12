# Japanese Romaji Answer Fix — 2026-11-12

## কী সমস্যা ছিল?
- `nihon ki` JavaScript ও Worker-এর Romaji recognition-এর তালিকায় ছিল না, তাই ইংরেজি হিসেবে ধরা হচ্ছিল।
- Gemini API অনুপলব্ধ হলে ইংরেজি Offline Error দেখাচ্ছিল। এটি Romaji conversion-এর সমস্যা এবং API সমস্যার দুটি পৃথক লক্ষণ।
- `nihon ki` প্রশ্নটি অসম্পূর্ণ; অর্থ অনুমান না করে জাপানিতে প্রশ্ন সম্পূর্ণ করতে বলা উচিত।

## কী পরিবর্তন করা হয়েছে?
1. Frontend `script.js` ও Cloudflare `index.js`: Japanese Romaji recognition-এ `nihon`, `nihongo`, `rekishi`, `kuni`, `shuto` ইত্যাদি যোগ করা হয়েছে। ইংরেজি প্রশ্ন ইংরেজিতেই থাকবে।
2. `nihon ki` বা `nihon wa`-এর মতো অসম্পূর্ণ ইনপুটে কোনো API Call ছাড়াই জাপানি Clarification দেখায়।
3. `nihon no rekishi wo oshiete` এখন `日本の歴史を教えて` হিসেবে পাঠিয়ে `ja-JP` language hint দেয়।
4. নতুন Code Load নিশ্চিত করতে `index.html`-এ script version পরিবর্তন করা হয়েছে।
5. নতুন automated checks: `tests/romaji-japanese-and-offline.test.mjs`।

## সীমাবদ্ধতা
- Gemini API key invalid, quota exhausted (429), Worker unavailable, or model provider down হলে **যেকোনো বিষয় নিয়ে নতুন AI উত্তর** দেওয়া সম্ভব নয়। Local Festival Data কাজ করবে, যেমন আগে করত।
- অসম্পূর্ণ Romaji-র ক্ষেত্রে Clarification, পূর্ণ Romaji-র ক্ষেত্রে Online Gemini।
- Live Worker endpoint, actual Gemini API, native iPhone Safari, Android microphone এই Build-এর মধ্যে পরীক্ষা করা হয়নি।

## Install (Windows)
### A. Patch
`TTC_Romaji_Japanese_Answer_Fix_Patch.zip` Extract করে নিম্নের তিনটি File একই Path-এ Replace করুন:
- `C:\terafes_04_fresh\script.js`
- `C:\terafes_04_fresh\index.html`
- `C:\terafes_04_fresh\cloudflare-worker\src\index.js`
Optional: `tests/romaji-japanese-and-offline.test.mjs` Copy করুন।

### B. GitHub Pages
```
cd /d "C:\terafes_04_fresh"
git status
git add index.html script.js cloudflare-worker/src/index.js
 git commit -m "Fix Japanese Romaji routing and offline clarification"
git push origin main
```

### C. Worker (এটিও প্রয়োজন)
```
cd /d "C:\terafes_04_fresh\cloudflare-worker"
npx wrangler deploy
```
`GEMINI_API_KEY` Worker Secrets-এ আগে থেকেই থাকতে হবে। কখনো Frontend Code বা GitHub Repo-তে API Key রাখবেন না।

## কীভাবে যাচাই করবেন
- `nihon ki` -> Japanese Clarification (API Call ছাড়াই)
- `nihon no rekishi wo oshiete` -> Japanese Answer (Gemini চললে)
- `501号室には何がありますか` -> Local Excel Answer (Gemini ছাড়াই)
- `What is Japan?` -> English Answer (Gemini চললে)
- DevTools > Network > `/chat` request-এ HTTP 429/502/503 কী আসছে দেখুন। Worker Logs-এ প্রকৃত Error দেখুন।

## Automated QA
- Frontend + Worker Romaji Test: 27/27 PASS (Gemini Mock)
- Desktop and 390px Phone-sized Chromium: 14/14 PASS (429 Simulation)
- Previous Tests including Floor/School/General Routing: all run with no failures

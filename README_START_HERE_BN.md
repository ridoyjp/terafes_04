# 学園祭 AI Chatbot — Deep Audit & Safe Update V2 (2026-10-22)

**এটি সম্পূর্ণ Project নয়, বরং ছোট Safe Update Package।** তোমার GitHub Team Project-এর `C:\terafes_04_fresh` Folder-এ প্রয়োগ করতে হবে। মূল UI, Robot Welcome Design, School Data এবং API Secret পরিবর্তন করা হবে না।

## কী ঠিক করা হয়েছে

1. **Back Button + AI Request:** Chat থেকে Back করলে Pending API Request Cancel; পুরোনো Reply আর নতুন Chat-এ দেখাবে না।
2. **iPhone Microphone Permission Race:** Permission দিতে দেরি হলে Back করার পর Recording শুরু হবে না; পুরোনো Mic Tracks বন্ধ হবে।
3. **Empty/Too Large Audio:** খালি বা বড় Audio Clip হলে `recordingBusy` আটকে থাকবে না।
4. **Chat Busy + Speech Errors:** Send Button Busy Guard এবং Speech Synthesis Exception Recovery (আগের V1 Update না থাকলেও প্রয়োগ হবে)।
5. **Chat Error Language:** Bengali/English সহ কিছু ভাষায় API Failure Feedback।
6. **Festival Data Safety:** 2026 সালের Teacher-Approved Data না থাকলে Sidebar-এর `食べ物`/`ゲーム`/`ステージ` ইত্যাদির তথ্য বানিয়ে বলবে না। 2025+2026 মিশ্র প্রশ্নেও Approval Guard।
7. **Multilingual Unverified Replies:** 16টি Locale-এর জন্য School Verification Message।
8. **Worker Request Size:** `Content-Length` না থাকলেও অতিরিক্ত বড় Chat JSON Reject।
9. **Robot Avatar:** AI Reply-এর পাশে User-Provided Blue Robot Image (`assets/robot-logo.png`)।
10. **iPhone Cache Refresh:** `index.html`-এ JS/CSS Version Update, যাতে পুরোনো Browser Cache কম সমস্যা করে।

## কীভাবে Install করবে (Windows CMD)

1. ZIP Download করে Windows-এর `Downloads` Folder-এ রাখো।
2. CMD-তে এই Command চালাও (ZIP Extract হবে Project Folder-এ):

```bat
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\Gakuen_AI_Deep_Audit_Update_V2_20261022.zip' -DestinationPath 'C:\terafes_04_fresh' -Force"
```

3. সঠিক Folder-এ গিয়ে Patch ও Tests চালাও:

```bat
cd /d C:\terafes_04_fresh
node apply-update-v2.cjs
node tools/deep-function-check.mjs
node tools/smoke-test.mjs
git status --short
git diff --stat
```

**65টি Offline Test PASS** হওয়ার কথা। Test FAIL হলে `git add`, `commit`, `push` করবে না; Error Output পাঠাবে। `Version mismatch` হলে Script/Worker বদলেছে—Patch ইচ্ছাকৃতভাবে থেমে যাবে; জোর করে Overwrite করবে না।

4. পরিবর্তনগুলো `git diff` দিয়ে দেখে নাও। Team Project-এর অন্যান্য File ভুল করে Stage করবে না।

```bat
git diff -- script.js index.html cloudflare-worker/src/index.js
git add script.js index.html assets/robot-logo.png cloudflare-worker/src/index.js tools/deep-function-check.mjs
git diff --cached --check
git commit -m "Fix mobile voice race, chat cancellation and multilingual festival replies"
git pull --rebase origin main
git push origin main
```

**Git Conflict হলে থামবে।** `git push --force` চালাবে না।

5. Worker-এর Code বদলেছে, তাই Cloudflare Worker আলাদা Deploy করতে হবে:

```bat
cd /d C:\terafes_04_fresh\cloudflare-worker
npx wrangler deploy
```

Worker-এ `GEMINI_API_KEY` Secret আগে থেকেই Configured থাকতে হবে; এটি ZIP-এ নেই।

6. iPhone-এ Website Refresh করো: https://ridoyjp.github.io/terafes_04/

## iPhone/Android-এ Manual Test (অবশ্যই)

- প্রথম Page-এ Blue Robot দেখা যাচ্ছে কি? `🔊` চাপলে Japanese Welcome Voice শোনা যায় কি?
- Safari/Chrome প্রথম Page Load-এ Auto Voice Block করতে পারে। Browser Autoplay Policy এড়িয়ে জোর করে Sound চালানো সম্ভব নয়; প্রথম Tap প্রয়োজন হতে পারে।
- Start → Chat → Back → Start ঠিক আছে কি?
- Text প্রশ্নে AI Reply আসছে কি? Chat Reply Logo ঠিক আছে কি?
- Mic Permission Allow/Deny দুটো অবস্থায় Status ঠিক আছে কি? Back করার পর Mic বন্ধ হচ্ছে কি?
- Japanese Voice Input, Bengali/English Text, Sound On/Off, Quick Questions, Network Error, 2026 Unverified Festival Data পরীক্ষা করো।
- Worker Deploy না করলে নতুন Backend Safety/Translation Changes Live হবে না।

## Scope এবং সীমাবদ্ধতা

এই Package আগের Chatbot Code Snapshot-এর সঙ্গে Test করা হয়েছে; GitHub-এ পরে নতুন পরিবর্তন হয়ে থাকলে Patch `Version mismatch` দিয়ে থামতে পারে। **65টি Test Offline/Mock**—Live Gemini, Real iPhone Mic/TTS, Live Cloudflare Deployment বা Festival Approval-এর Test নয়। Browser Integration Test এই Execution Environment-এ Blocked ছিল, তাই Browser PASS দাবি করা হচ্ছে না।

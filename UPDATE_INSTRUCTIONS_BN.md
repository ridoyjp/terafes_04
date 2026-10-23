# 学園祭 AI — Function Check & Safe Update

এটি সম্পূর্ণ Project নয়। বর্তমান GitHub Clone-এ **ছোট Update** প্রয়োগ করার Package।

## CMD Commands

1. ZIP-এর ভিতরের `apply-update.cjs`, `tools/`, `update-files/` ফোল্ডারগুলো `C:\terafes_04_fresh`-এ Extract করো।
2. CMD-তে:

```bat
cd /d C:\terafes_04_fresh
node apply-update.cjs
node tools/full-function-check.mjs
node tools/smoke-test.mjs
git diff --stat
git diff -- script.js
```

3. সব PASS হলে, `git status --short` দেখে **শুধু প্রয়োজনীয় File** Stage করো:

```bat
git add script.js assets/robot-logo.png tools/full-function-check.mjs
git commit -m "Improve chatbot reliability and blue reply robot avatar"
git pull --rebase origin main
git push origin main
```

Conflict হলে থামবে। `update-files/`, `apply-update.cjs` Commit করার দরকার নেই।

## কী পরিবর্তন হবে

- AI Message, Typing Indicator এবং Welcome Chat Bubble-এ আগের `robot-logo.png` Path-এই তোমার Blue Robot Image দেখাবে।
- AI Reply চলার সময় Send Button Disabled থাকবে এবং Chat Log `aria-busy` দেখাবে।
- Device Speech Synthesis-এ Exception হলে Chat আটকে না থেকে Text Reply দেখাবে।
- নতুন Automated Check: API/CORS/Input Validation/Language/Festival Data/Assets/JS Syntax।

## সীমাবদ্ধতা

এই Check-এ Live Gemini API, আসল Cloudflare Deployment, iPhone Microphone/Audio Playback এবং Browser Visual Layout Test করা হয় না। এগুলো Device-এ Manual Test প্রয়োজন।

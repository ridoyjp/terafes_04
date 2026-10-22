# TTC 学園祭 AI — Rounded Robot Body Update (Group 04)

## কী পরিবর্তন হয়েছে
- Robot-এর নিচের অংশটি এখন সুন্দরভাবে গোল (round-bottom belly), flat নয়।
- HD blue robot image: `assets/hero-robot-round-glow.png` (transparent PNG, 1254×1254)।
- আগের cyan chest light sparkle, eye blink, speaking-mouth animation রাখা হয়েছে।
- Japanese voice-এর ধীর গতি, Chat UI, Gemini/Cloudflare Worker অপরিবর্তিত।
- Laptop, iPad, iPhone ও Android-এ একই responsive design।

## Install (Windows)
1. প্রথমে `C:\terafes_04`-এর backup রাখুন।
2. `terafes_04_ROUND_ROBOT_UPDATE_ONLY.zip` extract করে সব ফাইলের folder structure ঠিক রেখে `C:\terafes_04`-এ Copy/Replace করুন।
3. CMD-তে চালান:

```bat
cd /d C:\terafes_04
node tools\robot-round-test.mjs
node tools\robot-talk-test.mjs
node tools\robot-glow-test.mjs
node tools\smoke-test.mjs

git add index.html robot-talk.css robot-body-glow.css assets/hero-robot-round-glow.png tools/robot-round-test.mjs tools/robot-talk-test.mjs tools/robot-glow-test.mjs README_ROUND_ROBOT_BN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Round robot lower body and preserve glow animation"
git push origin main
```

## Note
GitHub Pages আপডেট হওয়ার পর hard refresh দিন। Mobile Safari-তে Audio Autoplay প্রথম user interaction পর্যন্ত Block হতে পারে। Animation visual timing-based, exact lip-sync নয়। Cloudflare Worker redeploy দরকার নেই।

# Group 04 — HD Robot + Natural Japanese Voice (বাংলা নির্দেশনা)

## কী পরিবর্তন হয়েছে
- নতুন পরিষ্কার, high-resolution নীল Robot (`assets/hero-robot-hd.png`)
- Robot-এর চারপাশের গোল Border নেই
- Eye Blink + Japanese Voice চলাকালে Mouth Animation (visual approximation)
- Welcome Japanese Voice rate: **0.84**, Chat Japanese Voice rate: **0.88** (আগে 0.95)
- Voice Loop-এর মাঝে 1.2-second বিরতি, স্বাভাবিক Pause
- Laptop, iPhone, Android ও iPad-এ একই Design
- আগের Chat, Gemini Worker, Microphone, School Data অপরিবর্তিত

## Install (সবচেয়ে নিরাপদ)
1. `terafes_04_HD_ROBOT_DESIGN_ONLY.zip` Extract করো।
2. Extract করা ফাইলগুলো `C:\terafes_04`-এ Copy/Replace করো।
3. CMD:

```bat
cd /d C:\terafes_04
node tools\smoke-test.mjs
node tools\responsive-design-test.mjs
node tools\robot-talk-test.mjs
git add index.html script.js robot-talk.css assets/hero-robot-hd.png tools/robot-talk-test.mjs tools/responsive-design-test.mjs README_HD_ROBOT_BN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Improve HD robot and natural Japanese voice"
git push origin main
```

**দ্রষ্টব্য:** Cloudflare Worker redeploy দরকার নেই; frontend-এ পরিবর্তন হয়েছে। iPhone-এর Safari audible autoplay প্রথম user tap পর্যন্ত আটকে দিতে পারে। Mouth Animation শব্দের waveform/phoneme-ভিত্তিক exact lip sync নয়।

## Test Checklist
- Robot image পরিষ্কার এবং গোল Border নেই
- Japanese Voice স্বাভাবিক/ধীরে শোনা যায়
- Voice শুরু হলে Mouth Animation চলে, বন্ধ হলে থামে
- চোখ Blink করে
- Chat Button, FAQ, Mic, Sound Toggle কাজ করে
- iPhone, Android, Laptop, Tablet-এ Layout পরীক্ষা

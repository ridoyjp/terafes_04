# Group 04 — Exact Robot Design Update (বাংলা)

এই আপডেটে তোমার দেওয়া নীল glowing robot reference-টি Welcome Page-এ ব্যবহার করা হয়েছে।
Laptop / iPhone / Android / iPad-এ একই Logo, Robot, Background, Button এবং Japanese Text থাকবে।

## কী পরিবর্তিত হয়েছে
- `assets/hero-robot-exact.png` — তোমার reference অনুযায়ী mockup-এর একই blue glowing robot-এর transparent visual asset
- `assets/robot-user-reference.png` — তোমার দেওয়া ছোট robot image (reference)
- `index.html` — নতুন robot image path এবং stylesheet cache version
- `hero-responsive.css` — নতুন image-এর square layout ও responsive styling

**অপরিবর্তিত:** `script.js`, `style.css`, `cloudflare-worker/`, Gemini AI, Chat, Mic, Voice, Festival FAQ।

## Install (Design Only)

1. `terafes_04_EXACT_ROBOT_DESIGN_ONLY.zip` Extract করো।
2. Extract করা `index.html`, `hero-responsive.css`, এবং `assets`-এর নতুন দুটি PNG এবং `tools/responsive-design-test.mjs` `C:\terafes_04`-এ যথাস্থানে Copy করো।
3. CMD:

```bat
cd /d C:\terafes_04
node tools\smoke-test.mjs
node tools\responsive-design-test.mjs
git add index.html hero-responsive.css assets/hero-robot-exact.png assets/robot-user-reference.png
git diff --cached --check
git diff --cached --stat
git commit -m "Match exact blue robot across desktop and mobile"
git push origin main
```

Browser-এ GitHub Pages deploy শেষে refresh করো।

## Important
Mockup-এর device frame (laptop/phone) webpage-এ থাকবে না—ওগুলো design presentation।
Robot asset reference image থেকে নেওয়া, তাই এটি screen-size অনুযায়ী scale হবে।
Live voice, mic, Gemini API ও Safari browser testing এখনো আলাদাভাবে করতে হবে।

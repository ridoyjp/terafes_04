# Group 04 — 学園祭 AI Laptop + iPhone + Android + iPad Unified Design

## কী পরিবর্তন হয়েছে

- Laptop ও Mobile-এ **একই** Festival Logo, Blue Robot, Deep-Blue Background, Heading, Gradient Chat Button এবং তিনটি Shortcut দেখাবে।
- Screen width অনুযায়ী শুধু আকার, padding ও spacing পরিবর্তিত হয়।
- নতুন Blue Robot artwork: `assets/hero-robot-blue.png`। মূল `assets/welcome-robot.png` অক্ষত আছে।
- `hero-responsive.css` শুধুমাত্র Welcome/Intro screen-এর Design পরিবর্তন করে।
- তিনটি Shortcut এখন Chat খুলে সংশ্লিষ্ট প্রশ্ন পাঠায়।
- বিদ্যমান Gemini Cloudflare Worker, TTC Knowledge, Japanese Voice, Microphone, Robot Blink/Lip-sync, Chat Interface, Chat History, Security Configuration অপরিবর্তিত আছে।
- ছোট স্ক্রিনে scroll এবং reduced-motion support আছে।

## Update করার সবচেয়ে নিরাপদ পদ্ধতি

1. বর্তমান `C:\terafes_04` Project-এর Backup রাখো।
2. ZIP থেকে **নিচের ৫টি File** তোমার Project-এ Copy/Replace করো:
   - `index.html`
   - `script.js`
   - `hero-responsive.css` (নতুন)
   - `assets/hero-robot-blue.png` (নতুন)
   - `tools/responsive-design-test.mjs` (নতুন)
3. `style.css`, `config.js`, Cloudflare Worker এবং বাকি সব ফাইল **আগের মতোই থাকবে**।
4. Project root থেকে Command Prompt-এ চালাও:

```bat
cd /d C:\terafes_04
node tools\smoke-test.mjs
node tools\responsive-design-test.mjs

git add index.html script.js hero-responsive.css assets/hero-robot-blue.png tools/responsive-design-test.mjs
git diff --cached --check
git diff --cached --stat
git commit -m "Unify laptop and mobile festival AI welcome design"
git push origin main
```

5. GitHub Pages Deployment শেষ হলে Website খুলে Browser Cache Refresh করো:
   https://ridoyjp.github.io/terafes_04/

**Cloudflare Worker আবার Deploy করার দরকার নেই** — এই Update-এ Backend Code বদলানো হয়নি।

## Device Test Checklist

- [ ] Laptop 1440×900 — Logo, Robot, Title, CTA, Shortcuts একই style
- [ ] iPhone 390×844 — একই layout, কোনো horizontal overflow নেই
- [ ] Android 360×740 — Buttons ও Text দৃশ্যমান
- [ ] iPad 820×1180 — responsive spacing
- [ ] Chat Button → Chat খোলে
- [ ] Back → Intro-তে ফেরে
- [ ] Intro Shortcut → Chat খুলে প্রশ্ন পাঠায়
- [ ] Sound ON/OFF কাজ করে (autoplay browser restriction থাকতে পারে)
- [ ] Japanese Voice, Mic, Gemini Live Chat পরীক্ষা

## গুরুত্বপূর্ণ

Automated local smoke এবং source-level design tests pass করলে তার মানে **Live Gemini, iPhone Safari Voice বা Android Mic নিশ্চিতভাবে Pass** নয়। Real device-এ পরীক্ষা করতে হবে।

অজানা বা পুরোনো School/Teacher তথ্য Gemini যেন অনুমান করে না বলে—এটি Backend Knowledge Quality-এর আলাদা কাজ। এই Design Update সেটি পরিবর্তন করে না।

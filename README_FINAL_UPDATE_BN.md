# 学園祭 AI Chatbot — Final Professional Update V3

**তারিখ:** 2026-10-22। এটি পূর্ণ Project ZIP নয়; নিরাপদ Incremental Update। Team Project-এর মূল UI, Blue Robot, API Secret, Teacher-approved Festival Data অক্ষত রাখে। V2 আগে Install করা বাধ্যতামূলক নয়।

## কী পরিবর্তন

1. Welcome Japanese Voice Page Load-এ **best-effort autoplay** করে, Voice List দেরিতে Load হলে আরও একবার চেষ্টা করে। **iPhone Safari/Chrome-এ প্রথম Tap ছাড়া শব্দ চালানো Browser Restriction-এর কারণে নিশ্চয়তা দেওয়া যায় না।** উপরের ▶ / 🔊 Button এবং Screen-এর প্রথম Tap-এ Voice চালানো যাবে।
2. Mobile-এ `チャットを始める →` Button ছোট ও সুন্দর (সাধারণ ফোনে সর্বোচ্চ 320px), Desktop-এ সর্বোচ্চ 390px। Robot, Logo, Gradient, Layout বদলায় না।
3. School Knowledge Base 30+ Topic-এ Sync করা হয়েছে: 2027年度募集, 情報処理科, 留学生, 2028環境インフラ, Access/Contact, এবং পূর্বের Verified School Records। `school_information.json` এবং Worker `school-data.js` একই তথ্য রাখে।
4. পুরোনো Year-অস্পষ্ট Tuition Example বাদ দিয়ে অফিসিয়াল Tuition Link দেওয়া হয়েছে। Festival 2026-এর অনুমোদনহীন Dates/Prices/Rooms **যোগ করা হয়নি**।
5. Cache-bust Version আপডেট। পুরোনো CSS/JS ফোনে আটকে থাকার ঝুঁকি কমে।

## Windows CMD — একবারে একটি Command চালাও

ZIP Download করে `%USERPROFILE%\Downloads`-এ রাখো।

```bat
cd /d C:\terafes_04_fresh
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\Gakuen_AI_Final_Professional_Update_V3_20261022.zip' -DestinationPath 'C:\terafes_04_fresh' -Force"
node apply-final-update.cjs
node tools/final-professional-check.mjs
git diff --stat
git diff --check
```

**31/31 PASS** না হলে Push করবে না। `Version mismatch` এলে Output পাঠাবে। Original Files-এর Backup `.git/gakuen-final-pro-v3-backup/`-এ থাকবে।

### GitHub-এ Push (সব যাচাই করে)

```bat
cd /d C:\terafes_04_fresh
git add script.js style.css index.html school_information.json cloudflare-worker/src/school-data.js apply-final-update.cjs tools/final-professional-check.mjs README_FINAL_UPDATE_BN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Final professional welcome voice, mobile CTA and official school knowledge"
git pull --rebase origin main
git push origin main
```

Conflict হলে থামবে; `git push --force` চালাবে না। `C:\Users\freel` থেকে `git add -A` চালাবে না।

### Cloudflare Worker Update

```bat
cd /d C:\terafes_04_fresh\cloudflare-worker
npx wrangler deploy
```

Worker-এর `GEMINI_API_KEY` Cloudflare Secret-এ আগের মতোই থাকবে। GitHub Pages ও Worker আলাদা Deploy।

### Manual QA

- Laptop Chrome: Page Open → Welcome Voice Auto হলে ভালো; না হলে ▶ Click → Japanese Voice; Mute/Unmute; Robot Animation।
- iPhone Safari / Android Chrome: প্রথম Tap বা Speaker Button → Voice; Screen-এর Button ছোট; Start → Chat → Back; Mic Permission; Japanese voice question; Bengali/English Text।
- School QA: `情報処理科について`, `東中野からのアクセス`, `留学生の入学方法`, `2027年度募集について`, `2028年の環境インフラエンジニア科`।
- Festival QA: `2026年のフードの値段は？` → **未確認** বলা উচিত, অনুমোদন ছাড়া বানিয়ে বলা নয়।
- Live Worker-এর API Key, Gemini, iPhone Audio/Voice সত্যিকারের Device-এ Test করতে হবে; Offline Test এগুলো যাচাই করে না।

## Official sources

- https://tec.ttc.ac.jp/departments/
- https://tec.ttc.ac.jp/entrance/schedule/
- https://tec.ttc.ac.jp/school/access/
- https://tec.ttc.ac.jp/departments/it-game-web/data-processing/
- https://tec.ttc.ac.jp/entrance/international-students/
- https://tec.ttc.ac.jp/entrance/expenses/

**সীমাবদ্ধতা:** সব School Data-এর 100% Audit দাবি করা হচ্ছে না। তথ্য বদলালে Official Source/Teacher Confirmation দরকার।

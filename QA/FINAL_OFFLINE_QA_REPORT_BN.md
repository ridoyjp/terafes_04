# TTC FESTIVAL 2026 — Final Offline Fallback ও Cross-device QA

**পরীক্ষিত সংস্করণ:** 2026-11-12, বর্তমান `TTC_Festival_General_AI_Any_Topic_Full.zip`-এর ওপর আপডেট।

## কী পরিবর্তন করা হয়েছে

- Gemini API quota (`429`) বা Worker unavailable (`503`, network failure) হলেও **📋 情報一覧**-এর ৯টি Floor, ২১টি Excel Entry এবং ৩৪টি Activity ব্যবহার করা যায়। বাটন ক্লিকের উত্তর ব্রাউজারে থাকা স্কুলের Excel-derived JS থেকে আসে—Gemini-তে অনুরোধ যায় না।
- Chat-এ টাইপ করা নির্দিষ্ট Event বা Room প্রশ্নে একই Local Data ব্যবহার হয়। Room Number না থাকলে শুধু Floor দেখাবে; তথ্য বানাবে না।
- AI বন্ধ থাকলে সাধারণ প্রশ্নে পরিষ্কার Warning দেখাবে এবং স্থানীয় তথ্য মেনুর দিকে নির্দেশ করবে। AI বন্ধ থাকা অবস্থায় সাধারণ বিশ্বজ্ঞান-প্রশ্নের AI উত্তর **দেওয়া সম্ভব নয়**।
- `429` হলে ৫ মিনিট এবং `503` হলে ৩০ সেকেন্ড নতুন AI Request ঠেকানো হয়, কিন্তু Local Menu/Chat Answer বন্ধ হয় না।
- আটকে থাকা AI Request-এর মধ্যে Event বেছে নিলে পুরোনো Request cancel হয়ে Local Event Answer আসবে। Back চাপলেও পুরোনো Request cancel হবে।
- Event List থেকে দেওয়া উত্তর Gemini Conversation History-তে পাঠানো হয় না, ফলে পরের অপ্রাসঙ্গিক প্রশ্নকে Festival প্রসঙ্গের দিকে টেনে নেওয়ার ঝুঁকি কমেছে।
- Home Page, Logo, Robot, Speech settings, XLSX ও Cloudflare Worker-এর কার্যকর Code অপরিবর্তিত।

## পরীক্ষার ফল

| পরীক্ষা | ফলাফল | সীমাবদ্ধতা |
|---|---|---|
| Current Node Test Suite (`node --test`) | 39 / 39 PASS | Local/Mock |
| Worker API quota এবং Offline Routing | 25 / 25 PASS | Simulated 429 / missing key |
| Chromium Desktop | 28 / 28 PASS | Local Source injected into Chromium |
| Chromium Android-size (393×852) | 28 / 28 PASS | Android device নয় |
| Chromium iPhone-size (390×844) | 28 / 28 PASS | Safari নয় |
| Excel source record comparison | 21 / 21 rows, কোনো field mismatch নেই | Bundled XLSX|
| Natural Voice / Romaji Utility | 14 + 13 checks PASS | Mock; বাস্তব শব্দ নয় |

**মোট Browser Interaction: 84 / 84 PASS**। Screenshots QA evidence-তে আছে। Website HTML/CSS/JS সরাসরি Browser engine-এ inject করে পরীক্ষা করা হয়েছে, কারণ এই environment-এ localhost / fake-domain navigation blocked; এটি deployed website-এর end-to-end test নয়।

## যা যাচাই হয়নি

- আসল iPhone Safari/WebKit, iPhone Microphone ও Speaker-এর উচ্চারণ।
- আসল Android Chrome-এর Microphone Permission ও Speech Engine।
- Live Gemini API key, real daily quota, real Cloudflare Worker Deployment এবং GitHub Pages-এর বর্তমান deployed commit।
- সম্পূর্ণ Internet Connection না থাকলে **প্রথমবার Website খোলা** (GitHub Pages থেকে HTML/JS Download হবে না)। পৃষ্ঠা লোড হওয়ার পরে Gemini বন্ধ হলে Local Guide কাজ করবে।

## নিজে পরীক্ষা করবে

1. HTTPS Website খুলে **情報一覧 → すべての企画 → একটি অনুষ্ঠান** নির্বাচন: Room ও Floor দেখায় কি না।
2. DevTools → Network → Offline করে পৃষ্ঠা **Reload না করে** অন্য Event Button নির্বাচন: Local Answer আসবে।
3. Worker-এ Gemini quota শেষ হলে সাধারণ প্রশ্নে Offline Notice, কিন্তু 501号室 প্রশ্নে Excel Answer।
4. iPhone Safari, Android Chrome-এ Speaker/Mic পরীক্ষা করো। Browser permission দরকার।
5. পুরোনো Cached JavaScript থাকলে `Ctrl + Shift + R` দিয়ে Reload।

## ডেপ্লয়

GitHub Pages-এর জন্য `index.html`, `script.js` আপডেট ও Push প্রয়োজন। **এই সংস্করণে Cloudflare Worker Source পরিবর্তন করা হয়নি**; আগের Worker Deployment যদি Latest না হয়, তার নিজস্ব পরিবর্তন Deploy করতে হবে। API Key কখনো GitHub-এ রেখো না।

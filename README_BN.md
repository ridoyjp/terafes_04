# TTC 学園祭 AI — Welcome Sound Fix (22 Oct 2026)

## কী ঠিক হয়েছে

- Browser অনুমতি দিলে Landing Page খুলে Japanese Welcome Voice শুরু করার চেষ্টা করে।
- Browser autoplay block করলে ছোট ▶ button এবং Japanese text `🔊 音声ガイドを聞くには画面をタップしてください。` দেখায়।
- Landing Page-এ প্রথম Tap, কিংবা ▶ icon-এ প্রথম Click-এ Voice চালুর চেষ্টা করে। পুরোনো bug-এ প্রথম Click কখনও Mute হয়ে যেত — এটি ঠিক করা হয়েছে।
- Welcome Voice একবার শেষ হলে আবার বাজে। Chat Page-এ গেলে Voice বন্ধ হয়।
- AI নামের উচ্চারণ `がくえんさい、エーアイ` অপরিবর্তিত। Japanese Mic, AI reply, festival knowledge ও Worker অপরিবর্তিত।

## খুব গুরুত্বপূর্ণ সীমাবদ্ধতা

Chrome, Safari ও অন্যান্য Browser-এর Autoplay Policy JavaScript দিয়ে bypass করা যায় না। প্রথমবার Link খুলে **কোনো Tap ছাড়া সব Device-এ অডিও বাজবে** — এমন নিশ্চয়তা দেওয়া যায় না। এই Update automatic playback অনুমতি পাওয়া Browser-এ auto-start ও অন্য Browser-এ first-tap fallback দেয়।

## Install (Windows CMD)

1. বর্তমান `C:\terafes_04\script.js`, `index.html`, `style.css` Backup রাখুন।
2. ZIP থেকে এই তিনটি ফাইল Project Root-এ Replace করুন, অন্য কিছু Replace নয়।
3. CMD-তে:

```bat
cd /d C:\terafes_04
node --check script.js
git diff --check
git diff --stat
git add script.js index.html style.css
git commit -m "Fix welcome autoplay first-tap fallback"
git push origin main
```

4. GitHub Actions → `pages build and deployment` Success হলে https://ridoyjp.github.io/terafes_04/ খুলুন, Ctrl + Shift + R চাপুন।
5. F12 → Console-এ `[TTC Voice Version] welcome-autoplay-gesture-v4` দেখুন।
6. Link খুলে Voice বাজলে ঠিক; না বাজলে Landing Page-এর যেকোনো জায়গায় একবার Tap করুন (Chat Start button বাদে), অথবা উপরের ▶ icon-এ Tap করুন।
7. Chat Start করলে Welcome Voice বন্ধ হওয়ার কথা।

Cloudflare Worker-এর `npx wrangler deploy` লাগবে না।

## Validation

- `node --check script.js`: PASS
- Project `node tools/smoke-test.mjs`: PASS (local full workspace)
- Simulated Chromium browser tests: blocked autoplay → first tap, autoplay allowed, welcome loop, chat stop: PASS
- Real Android, iPhone Safari এবং Local Audio Output: এখনও হাতে পরীক্ষা করা হয়নি।

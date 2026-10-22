# TTC School Data + Romaji Japanese Update

এই আপডেটে TTC স্কুলের আগে থাকা ২২টি তথ্য-বিষয়ের পাশাপাশি校長/理事長, আরও নির্দিষ্ট স্টেশন-অ্যাক্সেস, স্কুলের ইতিহাস যোগ হয়েছে।

Romaji যেমন `TTC no kouchou wa dare desu ka?`, `Gakkou wa doko desu ka?`, `Gakka ni tsuite oshiete kudasai` দিলে Japanese script-এ উত্তর দেওয়ার নির্দেশ যুক্ত হয়েছে। সাধারণ English প্রশ্ন English-এই থাকবে।

## কোন ফাইল Replace করবে
- `script.js`
- `cloudflare-worker/src/index.js`
- `cloudflare-worker/src/school-data.js`
- `school_information.json` (reference)

**ওয়েবসাইটের design/index.html/style.css বদলানো হয়নি।**

## Deployment (Windows CMD)
```bat
cd /d C:\terafes_04
node --check script.js
node --check cloudflare-worker\src\index.js
node --check cloudflare-worker\src\school-data.js
cd cloudflare-worker
npx wrangler deploy
cd ..
git add script.js school_information.json cloudflare-worker/src/index.js cloudflare-worker/src/school-data.js
git commit -m "Add TTC school knowledge and Japanese Romaji responses"
git push origin main
```

**প্রয়োজনীয়:** Worker Deploy না করলে স্কুলের নতুন ডেটা ও Romaji উত্তর কাজ করবে না। Cloudflare Worker-এর `GEMINI_API_KEY` Secret অপরিবর্তিত থাকবে।

## Test
- `TTC no kouchou wa dare desu ka?` → 日本語で「白井雅哲先生」
- `Gakkou wa doko desu ka?` → 日本語で住所案内
- `What is TTC address?` → English
- `TTC-এর ঠিকানা কী?` → বাংলা
- `Gakuensai wa nanji desu ka?` → Japanese; 未確認なら日時を創作しない

Note: This is heuristic Romaji detection. Rare/ambiguous Romanized inputs might still be recognized as English; it does not provide full transliteration parsing or real-time site synchronization.

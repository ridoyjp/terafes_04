# TTC Official School Knowledge Update — 2026-10-22

এই ZIP-এ শুধুমাত্র 専門学校東京テクニカルカレッジ-এর অফিসিয়াল তথ্য আপডেট করা হয়েছে। Tokyo Automotive College-এর তথ্য যুক্ত করা হয়নি।

## পরিবর্তিত ফাইল
- `cloudflare-worker/src/school-data.js` — ১২টি অফিসিয়াল স্কুল FAQ/Knowledge entries যুক্ত।
- `cloudflare-worker/src/index.js` — school data যাচাইয়ের তারিখ সংশোধন।
- `school_information.json` — একই Knowledge Base-এর JSON কপি।

## Install / Deploy
1. ZIP থেকে এই ৩টি ফাইল `C:\terafes_04`-এর একই path-এ Replace করো (আগে backup রাখবে)।
2. CMD-তে:
```
cd /d C:\terafes_04
node --check cloudflare-worker\src\school-data.js
node --check cloudflare-worker\src\index.js
cd cloudflare-worker
npx wrangler deploy
cd ..
git add cloudflare-worker/src/school-data.js cloudflare-worker/src/index.js school_information.json
git diff --cached --check
git commit -m "Update official Tokyo Technical College knowledge"
git push origin main
```
3. Worker deploy ছাড়া live Gemini Chatbot নতুন Knowledge Base পাবে না।

## Sources
- https://tec.ttc.ac.jp/
- https://tec.ttc.ac.jp/departments/
- https://tec.ttc.ac.jp/school/access/
- https://tec.ttc.ac.jp/entrance/
- https://tec.ttc.ac.jp/entrance/expenses/
- https://tec.ttc.ac.jp/entrance/international-students/
- https://tec.ttc.ac.jp/entrance/international-students/int-scholarship/
- https://tec.ttc.ac.jp/international_students/
- https://tec.ttc.ac.jp/open-campus/

নোট: এটি পূর্ণ ওয়েবসাইটের সব পৃষ্ঠা নয়; যাচাইকৃত গুরুত্বপূর্ণ তথ্যের curated knowledge update। Tuition ও admission-এর পরিবর্তনশীল সংখ্যা অনুমান করা হয়নি। 2026 festival data অপরিবর্তিত।

## Security
আগের ZIP-এর `index.html` Microsoft Defender `Trojan:Win32/MalUri.A!cl` শনাক্ত করেছিল। এই প্যাকেজে `index.html`, `script.js`, `style.css`, `.git`, `.wrangler` বা executable নেই। Defender স্ক্যান সম্পন্ন না হওয়া পর্যন্ত file trust নিশ্চিত নয়। Defender সতর্কতা bypass করবে না।

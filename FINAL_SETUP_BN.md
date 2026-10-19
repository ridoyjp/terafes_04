# TTC AI Chat Bot — Final Setup (বাংলা)

এই ZIP টি পূর্ণ প্রজেক্ট, কিন্তু তোমার GitHub/Cloudflare-এ নিজে থেকেই পরিবর্তন করে না।

## কী আছে
- Gemini: শুধু স্কুল নয়; সাধারণ জ্ঞান, কোড, গণিত, অনুবাদসহ অনেক প্রশ্ন।
- প্রশ্নের ভাষায় উত্তর দিতে Worker-এ নির্দেশনা।
- Voice recognition: ডিভাইস সমর্থিত ভাষায়, dropdown-এ ভাষা নির্বাচন করতে হয়।
- Text-to-speech: ডিভাইসে install করা উপযুক্ত voice থাকলে নির্বাচিত ভাষায় বলার চেষ্টা। 100% সব ভাষা/ডিভাইস নিশ্চয়তা নেই।
- প্রথম পাতায় top-right 🔊 / 🔇; voice guide repeat হয়, Mute করলে বন্ধ; Start Now গেলে guide বন্ধ। ব্রাউজার autoplay ব্লক করতে পারে।
- TTC-এর অফিসিয়াল school info + source links। এগুলো static snapshot, real-time website synchronization নয়।
- FESTIVAL_TEACHER_DATA_TEMPLATE.json: teacher না দেওয়া পর্যন্ত সঠিক তারিখ/খাবার/রুম বানিয়ে দেওয়া যাবে না। Template অটোমেটিক Worker-এ যোগ হয় না।

## Backup & Copy
1. C:\terafes_04 এর আলাদা backup রাখো।
2. ZIP extract করে index.html, style.css, script.js, config.js, assets folder copy করো। config.js-এর পুরনো Worker URL থাকলে সেটি বজায় রাখবে।
3. cloudflare-worker/src/index.js এবং school-data.js নতুন ফাইল দিয়ে replace করো।
4. Cloudflare deploy: cd /d C:\terafes_04\cloudflare-worker তারপর npx wrangler deploy
5. GitHub: cd /d C:\terafes_04 তারপর git add index.html style.css script.js config.js assets cloudflare-worker/src/index.js cloudflare-worker/src/school-data.js
   git commit -m "Update multilingual school AI chatbot"
   git push origin main
6. LIVE: https://ridoyjp.github.io/terafes_04/

## Test from CMD (Origin required)
curl.exe -i -X POST "https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/chat" -H "Origin: https://ridoyjp.github.io" -H "Content-Type: application/json" -d "{\"message\":\"東京テクニカルカレッジの学科は？\"}"

## Important
- Secret GEMINI_API_KEY is only Cloudflare secret; do not put in repository.
- Local file:// origin is blocked by Worker. Test with HTTPS GitHub Pages.
- Browser recognition AUTO uses system language, not unlimited detection.
- News, weather and live details need separate trustworthy real-time data source; Gemini may be out of date.

# TTC AI Chatbot — Multilingual Update

## কী যোগ হলো
- Gemini যেকোনো বিষয় নিয়ে প্রশ্নের উত্তর দিতে পারে, শুধু School Information নয় (API-এর সীমা ও safety rules প্রযোজ্য)।
- লিখে বাংলা/ইংরেজি/জাপানি এবং আরও নানা ভাষায় প্রশ্ন করলে প্রশ্নের ভাষায় উত্তর দেওয়ার নির্দেশ।
- Voice language dropdown: Auto (device language), বাংলা, English, 日本語 এবং আরও ভাষা।
- Mic নির্বাচিত ভাষায় recognition চেষ্টা করবে। Device/browser support না থাকলে Voice কাজ নাও করতে পারে।
- AI Answer voice selected language বা উত্তর লেখার স্ক্রিপ্ট দেখে voice বেছে নেওয়ার চেষ্টা করবে। OS-এর উপযুক্ত TTS voice না থাকলে উচ্চারণ ভুল বা silence হতে পারে।
- Welcome voice ও School Knowledge Base অপরিবর্তিত।

## Deployment
1. ZIP extract করো।
2. index.html, style.css, script.js কপি করে C:\terafes_04-এ Replace করো।
3. cloudflare-worker/src/index.js এবং cloudflare-worker/src/school-data.js কপি করে C:\terafes_04\cloudflare-worker\src-এ Replace করো।
4. CMD: cd /d C:\terafes_04\cloudflare-worker && npx wrangler deploy
5. CMD: cd /d C:\terafes_04 && git add index.html style.css script.js cloudflare-worker/src/index.js cloudflare-worker/src/school-data.js && git commit -m "Add multilingual AI text and voice" && git push origin main
6. Live URL https://ridoyjp.github.io/terafes_04/ খুলে পরীক্ষা করো।

## সীমাবদ্ধতা
Web Speech API স্বয়ংক্রিয়ভাবে সব কথ্য ভাষা শনাক্ত করে না। Auto = ব্রাউজার/ডিভাইস ভাষা; অন্য ভাষা বললে dropdown থেকে সেটি আগে বেছে নাও। বাংলা Roman letters দিয়ে লিখলে ভাষা ভুল শনাক্ত হতে পারে; বাংলা অক্ষরে লেখাই ভালো। সব ভাষা ও সব OS-এ speech recognition এবং synthesis voice পাওয়া যাবে এমন গ্যারান্টি নেই। লাইভ ডেপ্লয় এখনো করা হয়নি।

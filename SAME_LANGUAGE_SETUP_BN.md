# Same Language Answer + Voice Fix

## পরিবর্তন
- বাংলা প্রশ্নে পুরো বাংলা উত্তর এবং বাংলা Voice (`bn-BD`)
- English প্রশ্নে পুরো English উত্তর এবং English Voice (`en-US`)
- Japanese প্রশ্নে পুরো Japanese উত্তর এবং Japanese Voice (`ja-JP`)
- Voice Typing-এর ভাষা Dropdown থেকে নির্বাচন করতে হবে; Browser Speech Recognition সব ভাষা অটোমেটিক শনাক্ত করতে পারে না।
- ফোনে সংশ্লিষ্ট ভাষার Speech Synthesis Voice না থাকলে ভুল ভাষায় পড়ার বদলে সতর্কবার্তা দেখাবে।
- Teacher-এর School Festival তথ্য না পাওয়া পর্যন্ত অনুমান করে উত্তর দেওয়া হবে না।

## Install
1. এই ZIP-এর script.js ফাইল Project root-এ Replace করো।
2. cloudflare-worker/src/index.js ফাইলটি তোমার Worker src-এ Replace করো।
3. Cloudflare Deploy:
   cd /d C:\terafes_04\cloudflare-worker
   npx wrangler deploy
4. GitHub Push:
   cd /d C:\terafes_04
   git add script.js cloudflare-worker/src/index.js
   git commit -m "Keep AI text and voice in user language"
   git push origin main
5. Live site-এ Bengali, English, Japanese দিয়ে Test করো।

## Attention
- Browser/OS-এর Bengali Voice না থাকলে বাংলা Voice স্বয়ংক্রিয়ভাবে কাজ করবে না।
- Bengali speech recognition-এর জন্য Language Dropdown-এ বাংলা নির্বাচন করো।
- Language model-এর output 100% flawless নিশ্চিত নয়; নিয়মটি অনেক বেশি শক্ত করা হয়েছে।

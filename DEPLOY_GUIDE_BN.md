# 学園祭 Chat Bot — Gemini AI + Cloudflare Worker

## কী তৈরি হয়েছে
- মূল UI/CSS/voice buttons একই রাখা হয়েছে।
- AI reply Gemini Worker দিয়ে আসে। পড়াশোনা, Programming, Translation, Science সহ সাধারণ প্রশ্নের উত্তর দেয়; ব্যর্থ হলে শুধু Festival-এর সীমিত keyword উত্তর fallback।
- কোনো Gemini API key browser বা GitHub-এ রাখা হয়নি।

## 1. Gemini API key
[Google AI Studio](https://aistudio.google.com/apikey) থেকে API key তৈরি করো। Gemini-এর free tier মডেল/অঞ্চল/কোটা অনুযায়ী পরিবর্তিত হতে পারে।

## 2. Worker Deploy (Windows CMD)
Node.js ইনস্টল থাকতে হবে। `node -v` এবং `npm -v` চালিয়ে পরীক্ষা করো। ZIP Extract করে `cloudflare-worker` ফোল্ডারে যাও।

```bat
cd /d C:\terafes_04\cloudflare-worker
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
```

শেষ command-এ API key Paste করো (terminal-এ key দেখা নাও যেতে পারে)। Secret update Worker-কে পুনরায় deploy করে। Worker URL হবে `https://gakuen-chatbot-ai.<subdomain>.workers.dev` জাতীয় কিছু।

## 3. Frontend Connect
Project root-এর `config.js` ফাইলে এই অংশ বদলাও:

```js
window.GAKUEN_CHAT_CONFIG = {
  apiUrl: 'https://gakuen-chatbot-ai.YOUR-SUBDOMAIN.workers.dev/chat'
};
```

এই URL-এ শুধু Worker hostname পরিবর্তন করবে; `/chat` অপরিবর্তিত থাকবে। `GEMINI_API_KEY` কোথাও frontend-এ লিখবে না।

## 4. GitHub Pages Deploy
`index.html`, `script.js`, `style.css`, `config.js`, `assets` ফোল্ডার GitHub repo root-এ থাকতে হবে। `cloudflare-worker` ফোল্ডার GitHub-এ থাকলেও secret থাকবে না।

```bat
cd /d C:\terafes_04
git add index.html script.js config.js cloudflare-worker .gitignore
git commit -m "Integrate Gemini AI through Cloudflare Worker"
git push origin main
```

GitHub Settings > Pages > Deploy from a branch > main / (root) নির্বাচন করো। তারপর `https://ridoyjp.github.io/terafes_04/` খোলো।

## 5. Test
- Chat start > 'こんにちは' > জাপানিতে AI reply।
- '東京はどこですか？' > সাধারণ জ্ঞানভিত্তিক উত্তর।
- '屋台の値段は？' > নিশ্চিত ডেটা না থাকায় বানিয়ে বলবে না।
- 🎙️ microphone permission দিয়ে প্রশ্ন করো, 🔊 বাটন দিয়ে sound বন্ধ/চালু করো।
- Worker URL এখনো না বসালে আগের keyword chatbot চলবে।

## Production সুরক্ষা
Origin checking **authentication নয়**; malicious clients নকল Origin পাঠাতে পারে। Public Worker endpoint-এ key abuse, bill/quota exhaustion রোধে Cloudflare WAF/Rate Limiting, bot protection, spending alerts বা আরও শক্তিশালী authentication যোগ করতে হবে। Free plans এবং limits পরিবর্তিত হয়।

## Troubleshooting
- CORS: সাইটের origin `https://ridoyjp.github.io` হওয়া চাই; অন্য domain হলে Worker-এর `EXTRA_ALLOWED_ORIGINS` variable-এ comma separated origin যোগ করো।
- 429: Gemini free quota শেষ হয়েছে।
- AI offline + basic answer: DevTools Console/Network থেকে Worker URL, `GEMINI_API_KEY`, বা browser connectivity দেখো।
- GitHub Pages 404: Settings > Pages সঠিকভাবে enable করো।

## Ask Anything (নতুন আপডেট)
- `東京について教えて`, `What is JavaScript?`, `বাংলায় Python শেখাও`, `Explain photosynthesis`, `Translate this Japanese sentence` — এসব সাধারণ প্রশ্ন Gemini উত্তর দিতে পারবে।
- Festival সম্পর্কিত অনিশ্চিত তথ্য বানিয়ে বলবে না।
- Voice answer জাপানি, ইংরেজি ও বাংলা টেক্সটের ভাষা অনুমান করে ব্রাউজারের উপলব্ধ voice নির্বাচন করবে (বাংলা ভয়েস না থাকলে ডিভাইসের TTS সীমাবদ্ধতা থাকতে পারে)।
- **Free মানে unlimited নয়**: Gemini-এর model/location-dependent free quota আছে। কিছু প্রশ্ন ভুলও হতে পারে, আর লাইভ ওয়েব ব্রাউজ করার ব্যবস্থা নেই।
- **AI কাজ করার জন্য** Gemini key, Worker deploy, এবং `config.js`-এ আসল Worker URL দেওয়া বাধ্যতামূলক। শুধু GitHub-এ ZIP push করলেই API সচল হবে না।

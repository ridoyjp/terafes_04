# terafes_04 — Full project review (23 Oct 2026)

## এই আপডেটে যা করেছি
- বর্তমান ডিজাইন, CSS, homepage, chat, Japanese voice auto-send logic অপরিবর্তিত রাখা হয়েছে।
- Cloudflare Worker-এ Gemini 429 (rate limit/quota) হলে immediate retry বন্ধ করা হয়েছে। Free quota দ্রুত নষ্ট হওয়ার ঝুঁকি কমে।
- Gemini 503 হলে শুধু একবার 0.5–1.0 সেকেন্ড বিরতি দিয়ে retry হবে।
- আগের 30 মিনিট cache, duplicate-call dedupe, isolate-local queue এবং FAQ fallback রাখা হয়েছে।
- ভুল করে তৈরি `h origin main` ফাইল ZIP থেকে বাদ দেওয়া হয়েছে।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
- একাধিক Worker isolate-এ queue global নয়; daily free limit শেষ হলে AI উত্তর নিশ্চিত করা যায় না।
- Live API, microphone এবং বিভিন্ন ফোনে বাস্তবে পরীক্ষা করা হয়নি।
- Cloudflare-এ GEMINI_API_KEY Secret এবং valid GEMINI_MODEL/GEMINI_AUDIO_MODEL configuration থাকতে হবে।

## Deploy (Windows CMD)
```cmd
cd /d C:\terafes_04_fresh\cloudflare-worker
npm install
npx wrangler deploy
cd /d C:\terafes_04_fresh
git status
git add cloudflare-worker/src/index.js FULL_REVIEW_UPDATE_BN.md
git commit -m "Review free API retry safeguards"
git push origin main
```

নতুন ZIP থেকে শুধুমাত্র `cloudflare-worker/src/index.js` এবং `FULL_REVIEW_UPDATE_BN.md` বর্তমান project-এ কপি করলেও হবে। 
আগের পরিবর্তনগুলো রেখে দেওয়ার জন্য `C:\terafes_04_fresh` folder overwrite করার আগে backup রাখুন।

## Manual test checklist
1. Website Ctrl+Shift+R refresh; chat `こんにちは` response
2. Mic-এ Japanese speech, stop speaking → auto-send
3. Mobile Chrome/Android ও Safari/iPhone-এ microphone permissions
4. 429/503 error-এর সময় graceful error text এবং browser console
5. Cloudflare Workers logs + Google AI Studio rate limits


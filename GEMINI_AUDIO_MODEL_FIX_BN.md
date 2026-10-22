# Gemini Audio Model 404 Fix — বাংলা নির্দেশনা

## কেন Voice Typing কাজ করছিল না?
Cloudflare Worker Log-এ Gemini 404 NOT_FOUND দেখিয়েছে: `gemini-2.5-flash` মডেলটি নতুন ব্যবহারকারীদের জন্য উপলব্ধ নেই। Provider সরাসরি `gemini-3.8-flash` ব্যবহার করতে বলেছে। তাই শুধু **Cloudflare Worker-এর Audio Transcription Model** পরিবর্তন করা হয়েছে। `chat`-এর মডেল, Design এবং Frontend অপরিবর্তিত।

## Update — Windows CMD

1. ZIP Extract করো। শুধু `cloudflare-worker/src/index.js` ফাইলটি তোমার `C:\terafes_04\cloudflare-worker\src\index.js`-এ Replace করো।
2. CMD-তে চালাও:

```bat
cd /d C:\terafes_04
node --check cloudflare-worker\src\index.js
findstr /n /i "gemini-3.8-flash" cloudflare-worker\src\index.js
cd /d C:\terafes_04\cloudflare-worker
npx wrangler deploy
cd /d C:\terafes_04
git add cloudflare-worker/src/index.js
git commit -m "Update Gemini audio model for multilingual transcription"
git push origin main
```

## গুরুত্বপূর্ণ
- `GEMINI_AUDIO_MODEL` নামে Cloudflare Variable/Secret থাকলে সেটি Code-এর Default Model-কে Override করে। সেক্ষেত্রে Cloudflare Settings-এ সেটি `gemini-3.8-flash` করতে হবে। `npx wrangler secret list`-এ এই নাম থাকলে আগে দেখো। `wrangler.jsonc`-এ Vars থাকলেও যাচাই করো।
- Provider-এর 404 নির্দেশনা অনুযায়ী মডেল পরিবর্তন করা হয়েছে। তোমার অ্যাকাউন্টে নতুন মডেল ও বিদ্যমান `generateContent` Audio Call কাজ করে কি না বাস্তব Deploy/Test ছাড়া নিশ্চিত নয়।
- `npx wrangler tail --format pretty` চালিয়ে Error দেখো; 429 হলে Quota, 404 হলে Model/Endpoint, 400 হলে Audio Format/Request পরীক্ষা করতে হবে।
- API Key Source Code বা GitHub-এ কখনো দেবে না।
- শুধু Worker Code বদলেছে। GitHub Pages-এর Frontend পুনরায় Publish প্রয়োজন নেই; Cloudflare Deploy অবশ্যই দরকার।

# AI Connection Fix (বাংলা)

এই সংস্করণে ভুলভাবে Error-এর সঙ্গে Food/Games/Stage-এর বানানো উত্তর দেখানো বন্ধ করা হয়েছে। 403/429/502/503/504/timeout অনুযায়ী স্পষ্ট Error দেখাবে। Request timeout 45 seconds।

**এটি Gemini API বা Cloudflare সমস্যাকে নিজে থেকে ঠিক করে না।** প্রথমে আসল Error শনাক্ত করো।

## GitHub Pages দিয়ে Test
https://ridoyjp.github.io/terafes_04/
Local file (file://) থেকে AI Request হবে না (Worker Origin policy)।

## API Test (CMD)
```bat
curl.exe -i -X POST "https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/chat" -H "Origin: https://ridoyjp.github.io" -H "Content-Type: application/json" -d "{\"message\":\"おすすめは何ですか？\"}"
```

200 হলে Worker সাড়া দিচ্ছে; GitHub Pages-এ সমস্যা থাকলে F12 > Console/Network দেখো। 502/504/429 হলে `cd /d C:\terafes_04\cloudflare-worker` এবং `npx wrangler tail` চালিয়ে Gemini provider error দেখো। API key কাউকে পাঠাবে না।

## Update
শুধু `script.js` Replace করো; তারপর:
```bat
cd /d C:\terafes_04
git add script.js
git commit -m "Improve AI connection errors and remove misleading fallback"
git push origin main
```
Cloudflare Worker অপরিবর্তিত।

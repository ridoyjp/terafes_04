# TTC Festival — শেষ পরীক্ষা ও Deploy (বাংলা)

## এই আপডেটে কী করা হয়েছে
- SQL Durable Object-এর empty-row fix রাখা হয়েছে।
- একই সময়ে একই public প্রশ্ন এলে একই Worker isolate-এ একটিমাত্র quota admission নেওয়া হয়। ভিন্ন isolate-এর ক্ষেত্রে এখনও shared cache ও Durable Object control আছে; global in-flight deduplication দাবি করা হচ্ছে না।
- Gemini Secret অনুপস্থিত থাকলেও verified school FAQ ও unverified 2026 festival safety reply কাজ করে।
- Frontend-এর 502 / 503 / 504 সমস্যার বার্তা আলাদা করা হয়েছে। কোনো button, CSS, logo, HTML layout বদলানো হয়নি।
- ৫টি বাস্তবistic Durable Object unit test যোগ করা হয়েছে; আগের ৩টি smoke test অপরিবর্তিত।
- Live diagnostic CLI যোগ করা হয়েছে, default mode কোনো Gemini request পাঠায় না।

## প্রথমে Backup
আগের `C:\terafes_04_fresh` ফোল্ডার আলাদা করে backup করে ZIP-এর ফাইলগুলো copy/overwrite করুন। `.dev.vars`, `.env`, `.git` বা API Secret overwrite/commit করবেন না।

## Windows CMD
```cmd
cd /d C:\terafes_04_fresh
node --check script.js
node --check cloudflare-worker/src/index.js
node --test tests/*.test.mjs
node tools/offline-load-test.mjs 200 5
cd /d C:\terafes_04_fresh\cloudflare-worker
npx wrangler deploy
cd /d C:\terafes_04_fresh
node tools/live-check.mjs
node tools/live-check.mjs --chat
```
শেষ কমান্ডটি **একটি বাস্তব AI request** করে; free quota থেকে request খরচ হতে পারে। `node tools/live-check.mjs` কেবল read-only check।

## GitHub update
```cmd
git status
git add script.js cloudflare-worker/src/index.js tests/backend-behavior.test.mjs tools/live-check.mjs FINAL_CHECKLIST_BN.md
git commit -m "Finalize festival quota and diagnostics"
git push origin main
```

## Live QA — manually test
1. https://ridoyjp.github.io/terafes_04/ খুলে hard refresh করে Japanese typed chat test।
2. Android Chrome ও iPhone Safari-তে mic permission, voice, auto-send, orientation change test। iOS/Safari browser-STT উপলব্ধতা ভিন্ন হতে পারে।
3. https://ridoyjp.github.io/terafes_04/admin/ এ Admin Secret দিয়ে stats refresh। Secret কাউকে দেবেন না।
4. সমস্যা থাকলে `cd cloudflare-worker && npx wrangler tail --format pretty` চালিয়ে প্রশ্ন করে log দেখুন।
5. Google AI Studio-এর Rate Limits-এ প্রকৃত model-specific quota দেখে `wrangler.jsonc`-এর cap adjust করুন; Worker-এর 400/day নিজস্ব safety cap, Gemini-এর অনুমোদিত quota নয়।

## যা এই ZIP দিয়ে নিশ্চিত করা যায় না
- Live Gemini API key validity, actual quota, dashboard token, mobile mic behavior বা live load capacity — নিজস্ব account/device ছাড়া যাচাই সম্ভব নয়।
- Local test-এ 200x5 = 1000 attempted; 400/day cap হলে 600 blocked হওয়ার simulation; এটি live performance result নয়।
- Free Plan unlimited নয়। Emergency FAQ কেবল অনুমোদিত facts দেয়, সব সাধারণ AI প্রশ্ন নয়।

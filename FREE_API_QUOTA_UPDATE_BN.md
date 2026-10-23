# Free Gemini API quota-saving update

এই update-এ original `index.html`, `style.css`, `script.js`, images এবং UI layout অপরিবর্তিত আছে। শুধুমাত্র `cloudflare-worker/src/index.js` পরিবর্তন করা হয়েছে।

## যা যোগ হয়েছে
- একই ধরনের ছোট, single-turn প্রশ্নের successful AI reply Cloudflare Cache API-তে ৩০ মিনিট সংরক্ষণ (best effort)। ব্যক্তিগত তথ্যের সম্ভাবনা থাকা প্রশ্ন ও chat history cache করা হয় না। Cache per Cloudflare location হতে পারে; global cache guarantee নয়।
- একই Worker instance-এ একই সময়ে একই প্রশ্ন এলে একবার Gemini call করা হয়।
- Per-isolate queue: ৩টি simultaneous API requests, ২০টি waiting requests; বেশি চাপ হলে 503 busy response। এটি global/distributed queue নয়।
- সাময়িক HTTP 429/503-এ সর্বোচ্চ একটি সংক্ষিপ্ত retry। Daily quota পূর্ণ হলে retry দিয়ে limit দূর হয় না।
- কিছু স্থির TTC পরিচিতির FAQ, আর পূর্বের verified/unverified Festival guard আগের মতোই চালু।
- Voice recognition-এ সীমিত queue ও retry, কিন্তু voice recordings cache হয় না (privacy)।

## Deploy
1. Cloudflare-এ থাকা `GEMINI_API_KEY` Secret অপরিবর্তিত রাখো। নতুন API key লাগবে না।
2. Terminal খুলে `cd cloudflare-worker` করো।
3. `npm install` তারপর `npx wrangler deploy` চালাও। Cloudflare login দরকার হতে পারে।
4. GitHub Pages UI-তে কিছু বদলানোর প্রয়োজন নেই। যদি তোমার Worker URL পরিবর্তিত হয়ে থাকে, আগের configuration মিলিয়ে নাও।
5. Browser দিয়ে Chat, Voice এবং স্কুলের festival প্রশ্ন পরীক্ষা করো।

## সতর্কতা
- এটি Gemini Free Tier-কে unlimited করে না। quota শেষ হলে AI chat/voice বন্ধ হতে পারে।
- Cache, queue এবং deduplication quota usage কমাতে সাহায্য করে; সব requests সবসময় সফল হবে এমন নিশ্চয়তা নেই।
- Cloudflare Cache API availability ও cache sharing platform/deployment অনুযায়ী আলাদা হতে পারে।
- পরীক্ষায় syntax ও included smoke test PASS; live Gemini API বা microphone-এর end-to-end পরীক্ষা এখানে করা হয়নি।

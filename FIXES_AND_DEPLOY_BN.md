# TTC Festival AI — সংশোধন ও Deploy

এই ZIP-এ সম্পূর্ণ website এবং Cloudflare Worker source আছে। `node_modules`, `.wrangler` cache এবং পুরোনো nested ZIP বাদ দেওয়া হয়েছে; এগুলো deploy-এর জন্য প্রয়োজন নেই।

## সংশোধন
- 429 quota block এখন নির্দিষ্ট কারণ ও Retry-After জানায়।
- Gemini ব্যর্থ হলে Groq → Cloudflare Workers AI → OpenRouter চেষ্টা করে, Gemini 400/401/404 হলেও।
- চারটি provider ব্যর্থ হলে 503 ALL_PROVIDERS_FAILED দেয়।
- OpenRouter HTTP 200-তে খালি উত্তর এলে 502 হিসেবে চিহ্নিত হয়।
- Gemini default model `gemini-2.5-flash-lite`; audio default `gemini-2.5-flash`। API account/model availability যাচাই করতে হবে।
- Quota statistics response-এ configured limits যুক্ত হয়েছে।

## Deploy (Windows CMD)
1. ZIP extract করে `cloudflare-worker` folder-এ যাও।
2. `npm ci`
3. `node --check src\index.js`
4. `npx wrangler secret list` (শুধু secret নাম যাচাই করো, মান শেয়ার করবে না)।
5. `npx wrangler deploy`
6. `npx wrangler tail`

Chat test (Windows CMD):
`curl.exe -i -X POST "https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/chat" -H "Origin: https://ridoyjp.github.io" -H "Content-Type: application/json" --data-raw "{\"message\":\"Hello\"}"`

**সতর্কতা:** 429 যদি daily quota শেষ হওয়ার কারণে হয়, code change সেটি reset করে না। UTC midnight-এ daily counter reset হয়। `ADMIN_STATS_TOKEN` দিয়ে `/admin/usage` থেকে counters দেখা যায়। Secrets কখনও public repo-তে রাখবে না। চারটি provider live test করা হয়নি।

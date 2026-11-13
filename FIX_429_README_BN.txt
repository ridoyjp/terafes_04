TTC Festival AI - 429 Diagnostic Fix

এই আপডেটে ৪টি AI fallback অপরিবর্তিত আছে এবং 429 error-এ reason/retryAfter দেখা যাবে।

1. পুরোনো প্রজেক্টের ব্যাকআপ নিন।
2. ZIP extract করুন।
3. cloudflare-worker folder-এ CMD খুলুন।
4. npm ci
5. node --check src\index.js
6. findstr /N /C:"QUOTA_LIMIT_REACHED" src\index.js
7. npx wrangler deploy
8. curl.exe -i -X POST "https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/chat" -H "Origin: https://ridoyjp.github.io" -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"

Quota error code দেখলে reason অনুযায়ী limit নির্ধারণ করুন। Deploy করলে Durable Object counters reset হয় না।
API key-গুলো Wrangler secrets-এ রাখতে হবে। npm ci বা deploy সফল হলেই provider key ঠিক আছে প্রমাণ হয় না।

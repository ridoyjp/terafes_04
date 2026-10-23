# Festival Free API Security + Voice Upgrade

মূল homepage, CSS, buttons ও existing features অপরিবর্তিত।

## আপডেট
- এক ক্লিকে Japanese voice recognition ও auto-send: পুরোনো fast browser recognition, fallback Gemini audio।
- Mobile recorder-এর ছোট audio chunks ও unexpected mic-track stop সামলানো।
- Shared, SQLite Durable Object quota counters: global minute/day এবং per-visitor minute/day।
- Sensitive তথ্য, raw IP, audio, question বা API key counters-এ সংরক্ষণ করা হয় না।
- Pre-existing 30-minute response cache, school FAQ, festival unverified-answer fallback ও retry অক্ষত।
- Private monitoring endpoint: GET /admin/usage with Authorization: Bearer TOKEN।

## প্রথম Deploy (Windows CMD)
```cmd
cd /d C:\terafes_04_fresh\cloudflare-worker
npx wrangler secret put ADMIN_STATS_TOKEN
npx wrangler deploy
```
ADMIN_STATS_TOKEN হিসেবে নিজের বানানো অন্তত 32 character-এর random secret ব্যবহার করো। কখনো GitHub-এ লিখবে না। আগের GEMINI_API_KEY secret অপরিবর্তিত।

## GitHub Update
```cmd
cd /d C:\terafes_04_fresh
git add script.js cloudflare-worker/src/index.js cloudflare-worker/wrangler.jsonc FESTIVAL_FREE_SETUP_BN.md
git commit -m "Festival voice and global quota protection"
git push origin main
```

## Admin stats (PowerShell)
```powershell
$token = Read-Host 'ADMIN_STATS_TOKEN'
Invoke-RestMethod -Uri 'https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/admin/usage' -Headers @{ Authorization = "Bearer $token" }
```

Counters are admitted Gemini calls (including provider failures), not Google's official remaining quota or the number of unique visitors. Daily UTC reset. The default cap is global 400/day, 25/minute; visitor 50/day, 6/minute. Tune these to your real AI Studio project quota, usually leave some margin for voice+chat (one voice query may cost TWO model calls). Cache hits and local FAQ are exempt from admission quotas. If shared quota service is unavailable, new Gemini calls are blocked rather than risk runaway usage; FAQs remain accessible. The limits control YOUR Worker, not Google model quotas; no guarantee of unlimited service. Cloudflare Durable Objects free-plan usage caps still apply.

Security caveat: browser Origin filtering and IP-based quotas are abuse deterrents, not user authentication; hostile clients can spoof Origin. Do not share admin token.

### Testing
1. Test Japanese voice on Android Chrome and iPhone Safari, and check auto-send.
2. Test repeated FAQ and cache hits.
3. Check /admin/usage with secret. Never publish screenshots showing token.
4. If Cloudflare migration/billing configuration prevents Durable Objects deployment, STOP and check Cloudflare plan rather than overwriting live Worker blindly.

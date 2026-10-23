# Festival Final Pro — Cloudflare SQL Fix

## Cause
Cloudflare Durable Objects SQL `.one()` throws when a SELECT returns no rows. New request counters and cache misses naturally return no rows.

## Fix
Use `.toArray()[0]` so missing counters are treated as zero and missing FAQ cache entries as misses. Keeps all quota and security checks active.

## Windows steps
1. Extract this patch ZIP. Copy `cloudflare-worker/src/index.js` into `C:\terafes_04_fresh\cloudflare-worker\src\index.js` and replace the file.
2. From CMD:

    cd /d C:\terafes_04_fresh\cloudflare-worker
    node --check src/index.js
    npx wrangler deploy

3. Test Japanese chat. Then:

    cd /d C:\terafes_04_fresh
    git add cloudflare-worker/src/index.js
    git commit -m "Fix empty Durable Object SQL results"
    git push origin main

Do not change Gemini key or ADMIN_STATS_TOKEN. No frontend files changed.

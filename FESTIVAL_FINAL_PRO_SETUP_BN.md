# Festival Final Pro — বাংলা Deploy Guide

## কী রাখা হয়েছে
- Existing homepage, CSS, robot এবং buttons আগের মতো।
- Existing Japanese SpeechRecognition fast auto-send এবং Gemini audio fallback। Mobile media track ended হলে recording clean-up।
- Durable Object shared per-minute এবং per-day quota control।
- Public school-specific single-turn answers 15 মিনিট shared cache; arbitrary personal conversations cache করা হয় না।
- 2026 festival event information unapproved হলে কখনো বানিয়ে উত্তর দেওয়া হয় না।
- আলাদা `admin/index.html` থেকে token-protected monitoring। Token localStorage/sessionStorage-এ save হয় না।
- Offline load test script; real users-এর সামনে stress test চালানো হয় না।

## Windows deployment
পুরো ZIP extract করে `C:\terafes_04_fresh`-এ ফাইলগুলো copy করো। Cloudflare Worker-এর `wrangler.jsonc` এবং `src/` update করো।

```cmd
cd /d C:\terafes_04_fresh\cloudflare-worker
npm install
npx wrangler deploy
cd /d C:\terafes_04_fresh
node --check script.js
node --test tests/smoke.test.mjs
node tools/offline-load-test.mjs 200 5
git status
git add script.js cloudflare-worker admin tests tools/offline-load-test.mjs FESTIVAL_FINAL_PRO_SETUP_BN.md
git commit -m "Festival Final Pro safe updates"
git push origin main
```

Existing `GEMINI_API_KEY` এবং `ADMIN_STATS_TOKEN` Cloudflare Secrets পুনরায় সেট করতে হবে না। `.env`, `.dev.vars`, API keys Git-এ দেবে না।

## Admin dashboard
GitHub Pages: `https://ridoyjp.github.io/terafes_04/admin/` — এই page public URL হলেও stats দেখার জন্য secret লাগে। চেনা/বিশ্বাসযোগ্য device ব্যবহার করো। Secret পাঠাবে না। Token দিয়ে refresh করো। Token browser এ persist হয় না।

## Important restrictions
- Google AI Studio-তে প্রকৃত Gemini RPM/RPD/TPM check করে `wrangler.jsonc` limit adjust করতে হবে। Worker limit Google quota নয়।
- Worker request safety cap পূরণ হলে AI সাময়িক বন্ধ হবে। Offline FAQ যতটুকু verified ততটুকুই থাকবে। Unlimited/zero downtime guarantee নেই।
- Dashboard ও voice-এর live browser tests deploy করার পর করতে হবে।

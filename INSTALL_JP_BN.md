# TTC 学園祭AI — Japanese-first Fix / ইনস্টল গাইড

## কী পরিবর্তন হয়েছে
- Japanese UI: প্রধান Button, quick categories, status এবং labels Japanese। ডিজাইনের CSS layout অপরিবর্তিত।
- Japanese mic: প্রথমে দ্রুত Browser SpeechRecognition (ja-JP); unsupported/network failure হলে Japanese-only Gemini Audio fallback। Fallback ধীর হতে পারে। iPhone Safari-সহ সব Browser-এ একই আচরণ নিশ্চিত নয়।
- Welcome Voice: 音声 text-এ `がくえんさい、エーアイ` ব্যবহার; loop এবং mute সংরক্ষিত। Browser autoplay block করলে Tap দরকার।
- 2026 Festival info: Teacher অনুমোদন ছাড়া তারিখ, বুথ, মূল্য, ফ্লোর বানিয়ে বলবে না। 2025 official event কেবল আগের বছরের উদাহরণ।

## Local install (Windows CMD)
1. সম্পূর্ণ `TTC_GAKUENSAI_JAPANESE_FIXED` Folder-এর ব্যাকআপ রাখো।
2. ZIP extract করো। Project root-এর `index.html`, `script.js`, `style.css` (অপরিবর্তিত), এবং `FESTIVAL_TEACHER_DATA_TEMPLATE.json`, `tools` ও `cloudflare-worker/src/index.js`, `cloudflare-worker/src/festival-data.js` ফাইলগুলো পুরোনো Project-এ একই Path-এ Copy করো। `config.js` এবং API Secret অপরিবর্তিত রাখবে।
3. `cd /d C:\terafes_04`
4. `node --check script.js`
5. `node --check cloudflare-worker\src\index.js`
6. `node --check cloudflare-worker\src\festival-data.js`
7. `node tools\sync-festival-data.cjs`
8. `git diff --check` এবং `git diff --stat` দেখো; অপ্রয়োজনীয় পরিবর্তন নেই নিশ্চিত করো।
9. Worker code বদলেছে, তাই Worker Deploy: `cd /d C:\terafes_04\cloudflare-worker` তারপর `npx wrangler deploy`।
10. Frontend GitHub Pages: `cd /d C:\terafes_04` তারপর `git add index.html script.js FESTIVAL_TEACHER_DATA_TEMPLATE.json cloudflare-worker/src/index.js cloudflare-worker/src/festival-data.js tools/sync-festival-data.cjs` তারপর `git commit -m "Improve Japanese UX voice and verified festival data"` এবং `git push origin main`।
11. GitHub Actions `pages build and deployment` green হলে website Ctrl+Shift+R। Cloudflare Worker deployment আলাদা।

## Festival data approval flow
- Teacher থেকে PDF/map/menu/timetable সংগ্রহ করো। `FESTIVAL_TEACHER_DATA_TEMPLATE.json`-এ কেবল নিশ্চিত তথ্য লেখো, খালি item সরাও।
- Teacher confirm করলে `approved_by`, `last_verified` (YYYY-MM-DD), `source_url` (official https link) অথবা `source_reference` (শিক্ষকের দেওয়া official internal document) পূরণ করে `status` = `APPROVED` করো।
- `node tools\sync-festival-data.cjs` Run করলে `cloudflare-worker/src/festival-data.js` তৈরি হবে; তারপর Worker Redeploy এবং Git Commit/Push করো।
- এখনও School Approval নেই বলে বর্তমান File `DRAFT`—এটি সঠিক এবং নিরাপদ।

## Japanese test
- UI: `チャットを始める`, `← 戻る`, `フード`, `ゲーム`, `会場案内`।
- Text: `TTC no kouchou wa dare desu ka?` → Japanese answer.
- Mic: `学園祭はいつですか？` → Japanese transcript + auto send.
- Festival: `2026年の屋台はどこですか？` → 未確認と案内; 2025年出店を2026年として断言しない。
- Welcome: `がくえんさい、エーアイ` の音声。音声エンジンによる発音差はあり得る。
- Android/iPhone: HTTPS で permission、音声、表示を実機確認。ブラウザーでの実機テストは未実施。

API key は `GEMINI_API_KEY` Worker Secret に置き、Frontend や ZIP に書かないでください。

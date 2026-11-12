# TTC Festival AI Chatbot — School + General Q&A Routing Fix

তারিখ: 2026-11-12

## সমস্যাটি কী ছিল?

আগে `東京のおいしい食べ物は何ですか`-এর মতো সাধারণ প্রশ্নের মধ্যে `食べ物` শব্দ থাকলে `festival-floor-guide.js` বা Cloudflare Worker-এর Floor Guide সোজা Festival Booth List দিয়ে দিত। ফলে Gemini-এ প্রশ্ন পৌঁছাত না। School-এর `学科` / `授業` সম্পর্কিত প্রশ্নেও ভুল করে Festival Booth দেখানোর ঝুঁকি ছিল।

## এখন কীভাবে কাজ করবে?

- **学園祭 / Event / Floor / Room / Booth**: স্কুলের ফ্লোর-গাইড XLSX থেকে উত্তর। প্রমাণ নেই এমন রুম বা নতুন অনুষ্ঠান অনুমান করবে না।
- **TTC School**: শিক্ষক/校長, ইতিহাস, স্কুলের বিষয় ও কোর্স, 학費, ভর্তি, বৃত্তি, চাকরি, যোগ্যতা ও যোগাযোগ সম্পর্কে যাচাই করা পাবলিক তথ্য Gemini Prompt-এ যুক্ত হবে।
- **অন্যান্য প্রশ্ন**: Tokyo Food, সাধারণ জ্ঞান, গণিত, Programming, ভাষা ইত্যাদি স্বাভাবিক Gemini Reply পাবে। Gemini Live API চালু, Secret এবং Quota ঠিক থাকতে হবে।
- **নির্ভরযোগ্যতা**: 2026-11-12 তারিখে যাচাই করা অফিসিয়াল ওয়েব-পৃষ্ঠার Snapshot। এটি Official TTC Website-এর *প্রতিটি* পৃষ্ঠার Live Search নয়। শিক্ষক-শিক্ষিকার পূর্ণ তালিকা বা যেসব বিষয় প্রকাশিত হয়নি, সেগুলোর নাম ও তথ্য বানিয়ে বলা যাবে না।
- **学費無料**: স্কুলের টিউশন সবার জন্য বিনামূল্যে নয়। নির্দিষ্ট যোগ্যতা পূরণ করলে Scholarship / Tuition Reduction থাকতে পারে।

## পরিবর্তিত ফাইল

- `festival-floor-guide.js` — ব্রাউজারে ভুল Festival Matching বন্ধ
- `cloudflare-worker/src/floor-guide-data.js` — Server-side Festival Matching সংশোধন
- `cloudflare-worker/src/index.js` — General Question vs School/Festival Knowledge আলাদা করা; পুরোনো Festival 2025 তথ্য অপ্রাসঙ্গিকভাবে না পাঠানো
- `cloudflare-worker/src/official-school-facts.js` — যাচাই করা স্কুল-তথ্য ও অফিসিয়াল Source URL
- `index.html` — শুধু Chat Placeholder ও Script Cache Version সংশোধন; Design অপরিবর্তিত
- `tests/school-general-routing-2026.test.mjs` — 37 টি Routing ও Data Test

## যাচাইকৃত অফিসিয়াল Source

- স্কুল ও পরিচিতি: https://tec.ttc.ac.jp/school/
- স্কুলের ইতিহাস: https://tec.ttc.ac.jp/school/history/
- 学科一覧: https://tec.ttc.ac.jp/departments/
- 情報処理科カリキュラム: https://tec.ttc.ac.jp/departments/it-game-web/data-processing/curriculum/
- IoT+AI カリキュラム: https://tec.ttc.ac.jp/departments/it-game-web/iot-ai/curriculum/
- データサイエンス+AI カリキュラム: https://tec.ttc.ac.jp/departments/it-game-web/data-science-ai/curriculum/
- Web動画 カリキュラム: https://tec.ttc.ac.jp/departments/it-game-web/web-visual-creator/curriculum/
- 学費: https://tec.ttc.ac.jp/entrance/expenses/
- 奨学金: https://tec.ttc.ac.jp/entrance/scholarship/
- 修学支援: https://tec.ttc.ac.jp/entrance/koutou-syugakushien/
- 留学生支援: https://tec.ttc.ac.jp/entrance/international-students/int-scholarship/
- 募集要項: https://tec.ttc.ac.jp/entrance/schedule/
- 就職サポート: https://tec.ttc.ac.jp/recruit/support/
- 資格: https://tec.ttc.ac.jp/recruit/qualification/
- 2026年度の校長/理事長: https://search.tsk.or.jp/search/viewnl.php?id=110031

## GitHub + Cloudflare Deployment (Windows CMD)

**1.** ছোট Patch ZIP Extract করে `C:\terafes_04_fresh\` Folder-এর ভেতর Relative Paths অক্ষত রেখে Replace করো। `.git` Folder Replace করবে না।

```bat
cd /d "C:\terafes_04_fresh"
git status
git add index.html festival-floor-guide.js cloudflare-worker/src/index.js cloudflare-worker/src/floor-guide-data.js cloudflare-worker/src/official-school-facts.js tests/school-general-routing-2026.test.mjs TTC_SCHOOL_QA_UPDATE_BN.md
git commit -m "Fix school and general questions routing; add verified TTC information"
git push origin main
```

**2.** Cloudflare Worker-ও Deploy করো (Git Push একা যথেষ্ট নয়, যদি Worker-এর আলাদা CI/CD না থাকে):

```bat
cd /d "C:\terafes_04_fresh\cloudflare-worker"
npx wrangler deploy
```

**3.** `https://ridoyjp.github.io/terafes_04/` খুলে Ctrl+Shift+R চাপো। `config.js`-এ Worker URL-এর সঙ্গে Deploy করা Worker মিলতে হবে। API Key `GEMINI_API_KEY` Cloudflare Secret-এ থাকবে; GitHub-এ Upload নয়।

## Testing

- `node tests/school-general-routing-2026.test.mjs` → **37/37 PASS** (Gemini API Mock করা হয়েছে)।
- `node --check script.js`, `node --check festival-floor-guide.js`, `node --check cloudflare-worker/src/index.js` → **PASS**।
- Live Gemini, Cloudflare Quota ও Actual Android/iPhone Microphone/Voice নতুন করে Test করা হয়নি।
- পুরোনো কিছু Automated Test পুরোনো Search/Menu Selector-ভিত্তিক ছিল; তাই সব পুরোনো Test Pass বলে দাবি করা হয়নি।

## হাতে পরীক্ষা করো

1. `東京のおいしい食べ物は何ですか` → Festival List নয়, Tokyo Food নিয়ে Gemini Reply।
2. `情報処理科では何を学べますか` → TTC Course ও Java/DB Curriculum।
3. `学費は無料ですか` → সবার জন্য বিনামূল্যে নয়; শর্তসাপেক্ষ Scholarship/Reduction।
4. `学校の歴史を教えて` → 1969 (Koyama Group) এবং 1987 (TTC) পার্থক্য।
5. `先生を全員教えて` → প্রকাশিত তথ্যের বাইরে শিক্ষক-তালিকা বানাবে না।
6. `11F 1103号室には何がありますか` → 11F/1103 Excel Data।
7. `学園祭の食べ物はどこですか` → Floor Guide Data।

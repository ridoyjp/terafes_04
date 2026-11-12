# TTC FESTIVAL 2026 — フロアガイド更新 (বাংলা নির্দেশনা)

## কী আপডেট হয়েছে
- `📋 情報一覧`-এ **全フロア + ৯টি ফ্লোর বাটন** দেখাবে। বাটন ক্লিক করলে panel বন্ধ হয়ে **Chat-এ স্কুলের Excel-এর ওই ফ্লোরের সব তথ্য** দেখাবে।
- 11F, 10F, 9F, 7F, 6F, 5F, 4F, 1F, B1F — সব ফ্লোরের তথ্য আছে।
- `5F / 501`-এ 情報処理科-এর展示 ও 生成AI অ্যাপ প্রদর্শনীর তথ্য আছে।
- Chatbot ফ্লোর/রুম/গেম/ক্যাফে ইত্যাদি সম্পর্কে Excel-এ থাকা তথ্য ব্যবহার করে উত্তর দিতে পারবে; এই উত্তরগুলোর জন্য Gemini API লাগবে না।
- Robot, Home Page, Voice Input, Voice Output, আগের UI/Code-এর অন্য অংশ অপরিবর্তিত।

## কোন ফাইল আপডেট হয়েছে
- `index.html` — 情報一覧-এ ফ্লোর গাইড দেখানোর অংশ এবং নতুন JS লিংক
- `script.js` — ফ্লোর বাটন click → chat question + local floor-guide answer
- `style.css` — শুধুমাত্র ফ্লোর গাইডের CSS
- `festival-floor-guide.js` — Browser data ও answer logic (নতুন)
- `festival_floor_guide_2026.json` — Excel থেকে সব source cell ও normalized data (নতুন)
- `cloudflare-worker/src/floor-guide-data.js` — Worker data ও answer logic (নতুন)
- `cloudflare-worker/src/index.js` — স্কুলের ফ্লোর তথ্যের জন্য deterministic reply
- `フロアガイドWK.xlsx` — **অপরিবর্তিত আসল ফাইল**

## গুরুত্বপূর্ণ
- Excel-এ যে তথ্য নেই (যেমন পুরো উৎসবের opening hours, প্রবেশমূল্য, টয়লেট/ইমার্জেন্সি রুট), সেগুলো তৈরি করা হয়নি।
- `FESTIVAL_TEACHER_DATA_TEMPLATE.json`-এর DRAFT approval অপরিবর্তিত; অনুমোদনকারী শিক্ষক/তারিখ কল্পনা করে লেখা হয়নি।
- GitHub Pages-এ frontend আপডেট দিতে project ফাইল commit/push করুন। Cloudflare Worker-এও নতুন তথ্য চালু করতে `cloudflare-worker` ডিরেক্টরি থেকে `npx wrangler deploy` করতে হবে।
- Worker deploy না করলেও নতুন frontend-এ floor-guide local replies কাজ করবে, তবে পুরনো Worker-এ direct API calls পুরনো উত্তর দিতে পারে।

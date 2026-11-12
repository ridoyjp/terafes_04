# 情報一覧 — 学園祭 Category + Full Event Buttons Update

স্কুলের **フロアガイドWK.xlsx** অনুযায়ী ৯ ফ্লোরের ২১টি এন্ট্রি অপরিবর্তিত রেখেই তথ্য一覧-এ ৩ ধরনের বাটন যোগ করা/রাখা হয়েছে:

1. **種類から探す**: 🎮 ゲーム・遊び, 🍰 フード・カフェ, 🤖 AI・科学・IT, 🧩 ものづくり・体験, 🖼️ 展示・発表, 🏠 建築・インテリア, 🎨 アート・デザイン, ℹ️ 相談・施設 এবং 🎪 すべての企画।
2. **フロアガイド**: আগের 全フロア / 11F / 10F / 9F / 7F / 6F / 5F / 4F / 1F / B1F।
3. **企画一覧**: স্কুলের Excel-এর প্রতিটি ২১টি event/room আলাদা বাটন।

সব বাটনে ক্লিক করলে 情報一覧 বন্ধ হয়ে Chat-এ স্কুলের Excel-এর মূল **description, room, department, time** দেখাবে। বাইরের AI/Gemini কল দরকার হবে না।

**গুরুত্বপূর্ণ:** স্কুলের মূল Excel-এ Category দেওয়া ছিল না; উপরের বিভাগগুলো শুধু navigation সহজ করার জন্য বর্ণনা অনুযায়ী শ্রেণিবদ্ধ করা হয়েছে। একটি Event একাধিক Category-তে আসতে পারে। Food-এ কেবল স্কুলের ফাইলের coffee corner ও international sweets corner আছে; অন্য খাবার বা দাম অনুমান করা হয়নি।

**Unchanged:** Home Page, Robot, Voice, Cloudflare Worker, source Excel, original 21 event records।

**Changed files:** `index.html`, `style.css`, `script.js`; new docs/tests. GitHub Pages-এ এগুলো update করলেই নতুন UI দেখা যাবে।

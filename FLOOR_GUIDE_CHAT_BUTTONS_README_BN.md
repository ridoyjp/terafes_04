# 🏢 フロアガイド — Chat Buttons Update (বাংলা)

**পরিবর্তন:** তথ্য一覧 থেকে 全フロア / 11F / 10F / 9F / 7F / 6F / 5F / 4F / 1F / B1F ক্লিক করলে প্যানেল বন্ধ হয়ে Chat-এ ওই ফ্লোরের স্কুলের Excel-এর সব তথ্য দেখাবে।

## ব্যবহার
1. `index.html` খুলে **チャットを始める** ক্লিক করো।
2. **📋 情報一覧** ক্লিক করো।
3. **11F** / **5F** / অন্য ফ্লোর ক্লিক করো।
4. Chat-এ আগে তোমার প্রশ্ন এবং নিচে ওই ফ্লোরের সব রুম/ইভেন্ট/学科/সময়সহ উত্তর দেখাবে।
5. **全フロア** ক্লিক করলে Excel-এর ৯ ফ্লোরের ২১টি তথ্য Chat-এ দেখাবে।

**Data source:** স্কুলের `フロアガイドWK.xlsx` থেকে আগেই তৈরি `festival-floor-guide.js`; কোন তথ্য নতুন করে অনুমান করা হয়নি। Gemini API ছাড়াও এই ফ্লোরগুলোর উত্তর local data থেকে দেখাবে।

**অপরিবর্তিত:** Home Page, Robot, Voice, সাধারণ Chat, Cloudflare Worker, Excel workbook এবং অন্য Project Files।

**আপডেট করা ফাইল:** `index.html`, `script.js`, `style.css`।

**Website-এ আপলোড:** GitHub Pages-এ এই তিনটি ফাইল update করলে নতুন বাটন কাজ করবে; Worker আবার deploy করতে হবে না (আগে school floor guide Worker deploy করা থাকলে)।

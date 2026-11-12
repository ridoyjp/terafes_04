# 情報一覧 — স্কুলের সম্পূর্ণ XLSX Data + Quick Search

**Source:** `フロアガイドWK.xlsx` (স্কুলের দেওয়া তথ্য; Project-এর মূল XLSX অপরিবর্তিত)।

## নতুন সুবিধা

- `情報一覧` খুলে Search Box-এ `501`, `ゲーム`, `food`, `カフェ`, `情報処理科` বা Floor/Room লিখলে উপযুক্ত বাটন তৎক্ষণাৎ দেখা যায়। টাইপ করার সময় নেটওয়ার্ক বা Gemini API কল হয় না।
- **৩৪টি Activity Button:** স্কুলের ২১টি掲載枠-এ থাকা আলাদা কার্যক্রম। প্রতিটির জন্য সরাসরি Chat উত্তর—নাম, Floor, Room, বিভাগ, যে বিবরণ বা সময় স্কুল দিয়েছে সব।
- **২১টি মূল Excel掲載枠 Button:** ভাঁজ করা `学校のExcel 21掲載枠をすべて見る` অংশ খুলে প্রতিটি মূল রেকর্ডের সম্পূর্ণ তথ্য সরাসরি Chat-এ দেখা যায়।
- **৯টি Floor** ও **৮টি Category** আগের মতো Chat-এ উত্তর দেয়; 全フロア ও すべての企画 রয়ে গেছে।
- Search Result-এ একটি Button ক্লিক করলে তথ্য তালিকা বন্ধ হয়ে Chat-এ স্কুলের তথ্য দেখা যায়। কেবল স্কুল Data থেকে উত্তর তৈরি হয়, Gemini API দরকার হয় না।
- `クリア` চাপলে Search Reset হয়। PC-তে Enter দিয়েও প্রথম Search Result নির্বাচন করা যায়। Mobile-এর জন্য Responsive Design ও 44px স্পর্শযোগ্য Button।
- আগের Chat Bubble ও Voice-এর **অপ্রয়োজনীয় চিহ্ন পরিষ্কার** করার কাজ অপরিবর্তিত।

## উদাহরণ

Search `501` -> `生成AIによる目押しゲーム` বাটনে ক্লিক -> Chat-এ `5F`, `501号室`, `情報処理科`, এবং ঐ掲載枠-এর স্কুল থেকে দেওয়া পূর্ণ বিবরণ দেখাবে।

## পরিবর্তিত ফাইল

- `index.html`: Search Field ও ২১টি মূল Excel掲載枠-এর ভাঁজ করা Section
- `script.js`: Search এবং ২১টি মূল掲載枠-এর জন্য Chat-integrated Buttons
- `style.css`: Desktop/Mobile Responsive Styling
- `tests/xlsx-all-buttons-quick-search.test.mjs`: Automated Regression Tests
- `tests/chat-visible-text-clean.test.mjs`: Resource Version Test আপডেট
- `FESTIVAL_QUICK_SEARCH_BN.md`: এই গাইড

## Data Integrity

- ২১টি掲載枠, ৯টি Floor, ৩৪টি পৃথক Activity-এর মধ্যে কোনোটি বাদ যায়নি।
- মূল XLSX, পূর্বের Data JSON ও Cloudflare Worker-এর ডেটা পরিবর্তন করা হয়নি।
- স্কুলের Excel-এ নেই এমন Room, Time বা Price তৈরি করা হয়নি।
- Browser-এ Live API Test আলাদা; Local Chat Reply কোনো বাহ্যিক API ছাড়াই কাজ করে।

## Local Test

`node --test tests/*.test.mjs`

## GitHub Deploy

Project Files Replace করার পর commit/push করে GitHub Pages-এ প্রকাশ করতে হবে। পুরোনো HTML/CSS cache এড়াতে Assets-এর Version String আপডেট করা আছে।

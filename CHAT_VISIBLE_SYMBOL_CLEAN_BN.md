# Chat Message Symbol Cleanup — 2026-11-09

এই আপডেটে শুধু Chat-এর মেসেজ বক্সের দৃশ্যমান টেক্সট পরিষ্কার করা হয়েছে। AI Bot এবং User—দুই ধরনের Bubble-এর অপ্রয়োজনীয় চিহ্ন যেমন `***`, `,`, `。`, `、`, `=!|_{}` আর decorative emoji মুছে যায়। প্রথম Welcome Message-ও একইভাবে পরিষ্কার।

উদাহরণ:
- আগে: `こんにちは！ *** ゲームは5F、501号室です。 =!|_{}`
- এখন: `こんにちは ゲームは5F 501号室です`

একাধিক ইভেন্টের উত্তর পড়তে সুবিধা হওয়ার জন্য **line break অক্ষত** থাকে। Floor ও Room Number ঠিক থাকে। সময় `10:30` থাকলে `10時30分` দেখায়, আর `2026-11-09` থাকলে `2026年11月9日` দেখায়। Voice speech punctuation আগের সংস্করণ থেকেই পরিষ্কার করা হয় এবং সেটি অপরিবর্তিত রাখা হয়েছে।

**অপরিবর্তিত:** মূল AI Response / API Request, Chat History-এর সংরক্ষিত মূল টেক্সট, ৩৪টি Event Button, ৯টি Floor, স্কুলের XLSX, Home Page/Robot Design, Worker, Voice Input, CSS ও Images।

**পরিবর্তন:** `script.js`, `index.html`, নতুন `tests/chat-visible-text-clean.test.mjs`, এই README।

**উল্লেখ্য:** এই আপডেটের UI Text Cleaner অলংকারমূলক punctuation বাদ দেয়। কোনো তথ্য না থাকলে নতুন তথ্য তৈরি করে না। আসল Browser এবং Live API পরিবেশের আলাদা পরীক্ষা দরকার।

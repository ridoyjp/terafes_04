# TTC 学園祭 AI Chat Bot — Complete Update (বাংলা Guide)

## কী যুক্ত হয়েছে
- Original index.html, style.css, script.js, config.js, assets অপরিবর্তিত অবস্থায় রাখা হয়েছে।
- Original Cloudflare Worker-এ 22 School Knowledge Topics সংযুক্ত হয়েছে।
- School facts are selected only for relevant school/festival questions; generic Gemini chat remains enabled.
- Teacher-এর অজানা Festival Time, Price, Classroom, Event বা Safety Information বানিয়ে বলা হবে না।
- school_information.json হলো review করার reference; live chatbot uses cloudflare-worker/src/school-data.js.
- FESTIVAL_TEACHER_DATA_TEMPLATE.json হলো Teacher-এর তথ্য নেওয়ার blank template; এটি স্বয়ংক্রিয়ভাবে live নয়।

## Backup আগে রাখবে
C:\terafes_04\cloudflare-worker\src\index.js পুরোনো file copy করে নিরাপদ জায়গায় রাখো।

## সহজ Update (প্রস্তাবিত, শুধু 2 ফাইল)
ZIP-এর cloudflare-worker/src/index.js এবং school-data.js কপি করো:
C:\terafes_04\cloudflare-worker\src\

## Worker Deployment (CMD)
```bat
cd /d C:\terafes_04\cloudflare-worker
npx wrangler deploy
```

## GitHub Backup
```bat
cd /d C:\terafes_04
git add cloudflare-worker/src/index.js cloudflare-worker/src/school-data.js
git commit -m "Add TTC school knowledge base to Gemini AI"
git push origin main
```

## পরীক্ষা
Visit https://ridoyjp.github.io/terafes_04/ and ask:
- 東京テクニカルカレッジの学科について教えて
- 留学生向けのサポートはありますか？
- 学園祭の屋台の料金はいくらですか？
- Explain JavaScript arrays in English

## সতর্কতা
- Production Cloudflare deploy এখানে করা হয়নি।
- তোমার Secret GEMINI_API_KEY আগের Worker secret থেকেই নেওয়া হবে।
- Festival Teacher Data confirm না হওয়া পর্যন্ত price/time/room number অজানা থাকবে।
- স্কুলের সাধারণ তথ্যের পরিবর্তন হতে পারে; অফিসিয়াল সাইট থেকে verify করো।
- Original design/voice code সংরক্ষিত; browser/device-level validation user needs to perform.

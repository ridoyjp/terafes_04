# Welcome Voice Update — Bangla Guide

## Features
- প্রথম Welcome Page-এ Japanese voice-এ AI app পরিচিতি ও ব্যবহারের আহ্বান
- Browser অনুমতি দিলে Automatic voice attempt; iPhone / Messenger-এ button tap প্রয়োজন হতে পারে
- Welcome Page-এ「🔊 音声ガイドを聞く」বাটন
- Start Now চাপলে voice বন্ধ হয়ে Chat খুলবে
- Mouse-follow light বন্ধ
- Mobile-এ chat open করলে automatic keyboard focus হবে না

## Installation (existing repo C:\terafes_04)
এই ZIP থেকে কেবল `index.html`, `script.js`, `style.css` ফাইলগুলো তোমার মূল Project Folder-এ copy/replace করো। Cloudflare worker এর কোনো পরিবর্তন প্রয়োজন নেই।

CMD:
```
cd /d C:\terafes_04
git add index.html script.js style.css
git commit -m "Add welcome voice guide and disable pointer light"
git push origin main
```

GitHub Pages খুলে পরীক্ষা করো: https://ridoyjp.github.io/terafes_04/

**Note:** iPhone Safari ও Messenger browser সাধারণত first page sound autoplay block করে। তাই Voice Button রাখা হয়েছে।

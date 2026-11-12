# TTC Festival 2026 — Romaji Japanese এবং Natural Voice Update

আপডেট: 2026-11-12

- `script.js`: Japanese Romaji চিনে পাঠানোর সময় Japanese Kana/পরিচিত TTC শব্দে রূপান্তর করে। উদাহরণ: `gakuensai no geemu wa doko desu ka?` → `学園祭のゲームはどこですか？`।
- English, Bangla ও আগে থেকেই Japanese-এ লেখা মেসেজ অপরিবর্তিত থাকে। এটি সম্পূর্ণ Kanji IME নয়; সব Romaji শব্দের নির্ভুল Kanji রূপান্তরের জন্য Windows/macOS/Android/iPhone Japanese IME ব্যবহার করতে হবে।
- Chat bubble-এ প্রাসঙ্গিক `、。！？` চিহ্ন রাখা হয়। `*** =!|_{}` ইত্যাদি অপ্রয়োজনীয় প্রতীক পরিষ্কার হয়।
- Speaker/Robot-এ কোনো `、。！` বা ASCII punctuation পাঠানো হয় না। কমার পরে 210ms ও বাক্য শেষে 430ms বিরতি যোগ করা হয়। ভয়েস স্পিড সাধারণ Japanese কথার কাছাকাছি (Chat 0.93, Welcome 0.92)।
- Browser-এর Installed Voice, Browser Autoplay Policy ও device-এর ওপর আসল উচ্চারণ নির্ভর করে। iPhone Safari ও Android বাস্তব ডিভাইস পরীক্ষার প্রয়োজন।
- Main UI, School Excel Data, Gemini Endpoint/Worker, Buttons এবং Navigation অপরিবর্তিত। `index.html`-এ শুধু script cache version পরিবর্তিত।

## Reproducible Tests

```bash
node --check script.js
node tools/natural-voice-romaji-test.cjs
```

পুরোনো `tools/smoke-test.mjs` নতুন UI থেকে সরিয়ে দেওয়া Stage Button খোঁজে এবং পাস করে না; সেটিকে এই Voice Update-এর Regression হিসেবে ধরা যাবে না।

- Voice-reading only: `5F`-কে `5階`, `11:00`-কে `11時00分` এবং `11/14`-কে `11月14日` হিসাবে উচ্চারণের জন্য পাঠানো হয়; XLSX-এর Data পরিবর্তন হয় না।

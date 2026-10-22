# একবার ট্যাপ → ২ সেকেন্ড নীরবতা → স্বয়ংক্রিয় Send

- 🎙️ একবার ট্যাপ করলে রেকর্ডিং শুরু হবে।
- কথা শুরু হয়ে শেষ হওয়ার পরে প্রায় ২ সেকেন্ড নীরব থাকলে Recording বন্ধ হবে।
- Gemini Audio transcribe করলে প্রশ্ন স্বয়ংক্রিয়ভাবে `ask()` দিয়ে পাঠানো হবে।
- নীরবতা শনাক্ত করা না গেলে ১২ সেকেন্ড Safety Stop; চাইলে ⏹ চাপা যায়।
- Language Dropdown ছাড়াই Audio Gemini-তে পাঠিয়ে ভাষা শনাক্ত করার পদ্ধতি অপরিবর্তিত।
- Web Audio amplitude দেখে, ভাষা নয়। ব্যাকগ্রাউন্ড শব্দ থাকলে Silence Detection কম নির্ভরযোগ্য হতে পারে।
- Network/Gemini Processing-এর কারণে Auto Stop-এর পরও উত্তর আসতে সময় লাগতে পারে।

## Windows CMD

ZIP-এর `script.js` ফাইলটি `C:\terafes_04\script.js`-এ Replace করো।

```bat
cd /d C:\terafes_04
node --check script.js
git add script.js
git commit -m "Add one-tap voice recording with silence auto send"
git push origin main
```

শুধু Frontend বদলেছে। Worker Redeploy দরকার নেই।

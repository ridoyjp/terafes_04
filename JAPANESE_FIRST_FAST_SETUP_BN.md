# Japanese-First Fast Voice (পরীক্ষামূলক)

- Japanese device/browser language (`ja-JP`) হলে Browser SpeechRecognition প্রথমে চেষ্টা করবে। Final Japanese transcription পাওয়া গেলে সঙ্গে সঙ্গে Auto Send করবে।
- একই সঙ্গে short audio backup নেওয়া হবে; browser STT ব্যর্থ হলে আগের Gemini Multilingual transcription চালু থাকবে।
- Japanese ছাড়া অন্য device language হলে Gemini multilingual পদ্ধতিই চলবে। এটি Japanese-First, **সত্যিকারের সব ভাষার automatic speech detection নয়**।
- Browser SpeechRecognition ও MediaRecorder একই সঙ্গে microphone ব্যবহার করায় কিছু browser-এ প্রতিযোগিতা/permission conflict হতে পারে; real-device test প্রয়োজন।
- `index.html`-এর কেবল script cache version বদলেছে; CSS/layout বদলায়নি।
- `script.js` এবং `index.html` দুইটিই project folder-এ Replace করতে হবে। Worker deploy দরকার নেই।

Windows CMD:
```
cd /d C:\terafes_04
node --check script.js
git add script.js index.html
git diff --cached --stat
git commit -m "Add Japanese first browser speech with Gemini fallback"
git push origin main
```

Chrome console-এ `[Voice timing] Japanese browser STT` থাকলে fast path ব্যবহার হয়েছে। `[Voice timing] transcription total:` থাকলে Gemini fallback ব্যবহার হয়েছে।

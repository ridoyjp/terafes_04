# TTC 学園祭 AI — Talking Robot Update (Group 04)

## কী পরিবর্তন করা হয়েছে
- Robot-এর মাথার চারপাশের আলাদা গোল Halo/Circle Border সরানো হয়েছে।
- আগের Blue Robot Artwork, TTC Logo, Background, Button ও Responsive Layout রাখা হয়েছে।
- Robot-এর চোখ Blink করবে এবং Welcome Japanese Speech চলার সময় মুখ নড়বে।
- Welcome Speech বন্ধ হলে Mouth Animation বন্ধ হবে।
- CSS-ভিত্তিক mouth movement কথার সঙ্গে আনুমানিকভাবে চলে; এটি প্রকৃত audio waveform lip-sync নয়।
- iPhone Safari/Android Chrome-এ অডিও শুরু হতে প্রথম Tap লাগতে পারে।

## নিরাপদ Install — Design Only ZIP
1. আগে `C:\terafes_04` ফোল্ডারের Backup রাখুন।
2. Design Only ZIP থেকে `index.html`, `robot-talk.css`, `tools/robot-talk-test.mjs` কপি করে `C:\terafes_04`-এ রাখুন।
3. আপনার আগের Project-এ `assets/hero-robot-exact.png` না থাকলে ZIP থেকে সেটিও কপি করুন।
4. `index.html`-এ `hero-responsive.css` এবং `script.js` আগের মতোই থাকতে হবে।
5. CMD-তে চালান:

```bat
cd /d C:\terafes_04
node tools\robot-talk-test.mjs
node tools\smoke-test.mjs
git add index.html robot-talk.css tools/robot-talk-test.mjs
rem নতুন asset দরকার হলে: git add assets/hero-robot-exact.png
git diff --cached --check
git diff --cached --stat
git commit -m "Animate TTC robot eyes and mouth without circle border"
git push origin main
```

## যাচাই
- Chrome/Edge-এ Welcome Page খুলে Robot-এর চারপাশে গোল Border আছে কিনা দেখুন।
- Eye Blink দেখুন; speaker button চাপলে Voice শুরু ও মুখের Animation দেখুন।
- Mute করলে মুখ থেমে যায় কিনা দেখুন।
- Chat Start দিলে Welcome Voice ও মুখের Animation বন্ধ হয় কিনা দেখুন।
- iPhone/Android-এ Test করুন।

## Scope
Cloudflare Worker/Gemini API/School Knowledge পরিবর্তন করা হয়নি।

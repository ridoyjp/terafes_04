# Mobile Sound / Auto Play Fix

- iPhone Safari ও Android Chrome-এ Welcome Voice অটোমেটিক চালুর চেষ্টা হবে।
- Browser autoplay Block করলে Welcome Screen-এ **একবার Tap** করতে হবে। এই নিয়ম Web Code দিয়ে bypass করা যায় না।
- উপরে ডানদিকে একটি 🔊/🔇 Mute Icon থাকবে।
- Voice শেষ হলে আবার চলবে, Mute করলে বন্ধ হবে। Start Now চাপলে Welcome Voice বন্ধ হবে।
- Japanese Welcome Voice এবং Chat-এর Multilingual Voice Code অক্ষত আছে।

## Installation

ZIP Extract করে `script.js` ফাইলটি `C:\terafes_04\script.js` এ Replace করুন।

```bat
cd /d C:\terafes_04
git add script.js
git commit -m "Improve mobile Safari and Chrome welcome voice"
git push origin main
```

Cloudflare Worker deploy লাগবে না। GitHub Pages থেকে Test করুন, file:// থেকে নয়।

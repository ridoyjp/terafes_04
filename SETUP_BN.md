# Welcome Auto Voice + Mute Button

- প্রথম পেজে Voice Guide অটোমেটিক চালুর চেষ্টা করবে।
- শুধু `🔊 Sound On` বাটন থাকবে। কথা চললে চাপলে Mute হবে।
- Mute থাকলে `🔇 Sound Off` চাপলে পুনরায় Voice চলবে।
- iPhone, Safari, Messenger-এর autoplay restriction থাকলে Sound On চাপলে Voice শুরু হবে।
- Start Now চাপলে Welcome Voice বন্ধ হবে।

## Deploy
ZIP থেকে `index.html`, `script.js`, `style.css` কপি করে `C:\terafes_04\`-এ Replace করো।
তারপর CMD:

```bat
cd /d C:\terafes_04
git add index.html style.css script.js
git commit -m "Autoplay welcome voice with single mute button"
git push origin main
```

Cloudflare Worker redeploy করার প্রয়োজন নেই।

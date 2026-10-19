# Continuous Welcome Voice — বাংলা গাইড

- Welcome Page লোড হলে Japanese voice চালুর চেষ্টা হয়।
- একটি 🔊 আইকন আছে; ক্লিক করলে 🔇 এবং ভয়েস বন্ধ। আবার ক্লিক করলে পুনরায় শুরু।
- Voice শেষ হলে 450 ms বিরতির পর আবার চালু হয় (Welcome Page দৃশ্যমান থাকা পর্যন্ত)।
- Start Now চাপলে কথা বলা বন্ধ হয়; Back করে Welcome-এ ফিরলে আবার চলে (Mute না থাকলে)।
- অন্য Tab-এ গেলে বন্ধ হয়।
- মোবাইল Safari/Messenger-এ প্রথম User Tap ছাড়া autoplay block হতে পারে—Browser policy এড়িয়ে যাওয়া সম্ভব নয়।

## Update
`index.html`, `style.css`, `script.js` ফাইলগুলো C:\terafes_04-এ Replace করো।

```bat
cd /d C:\terafes_04
git add index.html style.css script.js
git commit -m "Repeat welcome voice until muted"
git push origin main
```

Worker পরিবর্তন হয়নি, Wrangler deploy প্রয়োজন নেই।

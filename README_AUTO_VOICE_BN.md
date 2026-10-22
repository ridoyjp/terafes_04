# TTC 学園祭 — Automatic Welcome Voice (No On-Screen Prompt)

- Website load হলে browser অনুমতি দিলে Japanese Welcome voice নিজে শুরু করবে।
- Welcome voice শেষ হলে আবার চলবে; Welcome Page-এ থাকলে চলতে থাকবে।
- Sound ON/Tap/Permission-এর দৃশ্যমান hint সরানো হয়েছে।
- Browser autoplay block করলে **কোনো code দিয়ে জোর করে চালানো সম্ভব নয়**। প্রথম tap/click-এ অদৃশ্য fallback দিয়ে চালু হবে।
- Chat page খুললে Welcome Voice থামবে; Back করলে আবার শুরু হবে।
- Existing microphone permission is unchanged; voice input ব্যবহার করলে browser microphone permission চাইতে পারে।
- Sound mute/unmute button রাখা হয়েছে, যাতে visitor প্রয়োজন হলে শব্দ বন্ধ করতে পারে।

## Install
ZIP থেকে `index.html`, `script.js` replace করো (backup রেখে)।
```
cd /d C:\terafes_04
node --check script.js
git add index.html script.js
git diff --cached --check
git commit -m "Auto-play looping welcome without sound prompt"
git push origin main
```

# Short looping Japanese welcome voice

- Website-এ Welcome-এর দৃশ্যমান লেখা অপরিবর্তিত।
- জাপানিতে সংক্ষিপ্ত Welcome Voice:
  こんにちは！TTC 学園祭エーアイ・チャットボットへようこそ！日本語を基本に、世界中のさまざまな言語で質問できます。音声でも文字でも、お気軽に質問してください！
- Sound চালু থাকলে 250ms বিরতি দিয়ে বারবার বলা হবে; mute করলে থামবে।
- Start Now চাপলে Welcome Voice থামবে।
- মোবাইল Browser user interaction ছাড়া অডিও autoplay ব্লক করতে পারে; স্ক্রিনে প্রথম tap দরকার হতে পারে।

Install: ZIP থেকে শুধু script.js ফাইল C:\terafes_04\script.js-এ replace করো।

```bat
cd /d C:\terafes_04
git add script.js
git commit -m "Short Japanese welcome voice repeat until muted"
git push origin main
```

Cloudflare Worker deploy লাগবে না।

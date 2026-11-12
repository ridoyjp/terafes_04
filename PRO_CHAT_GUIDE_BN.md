# TTC FESTIVAL 2026 — Professional Chat Guide

## কী পরিবর্তন করা হয়েছে

- 情報一覧 এখন শুধু ৫টি প্রধান বাটন: ゲーム・体験 / フード・カフェ / AI・展示 / フロア・部屋 / すべての企画।
- বাটনে চাপলে তথ্য সরাসরি Chat-এ দেখাবে এবং সংশ্লিষ্ট আরও ৪টি বাটন সাজেশন হিসেবে আসবে।
- 次へ / 前へ দিয়ে পরের চারটি, 戻る দিয়ে আগের তালিকা, メニュー দিয়ে প্রধান তালিকায় ফেরা যাবে।
- ৩৪টি আয়োজন, ২১টি স্কুলের XLSX রেকর্ড এবং ৯টি Floor একই ডেটা থেকে রাখা হয়েছে।
- Room নম্বরবিহীন আয়োজনের জন্য কোনো নম্বর অনুমান করা হয় না। 405/407 যৌথ তথ্য স্পষ্ট দেখায়।
- Chat ও Voice-এর আগের অপ্রয়োজনীয় চিহ্ন সরানোর ব্যবস্থা অপরিবর্তিত।
- Home/Robot/Mic/Gemini/Cloudflare Backend অক্ষত।

## GitHub-এ আপডেট

Patch ZIP-এর index.html, script.js, style.css একই নামের ফাইলের জায়গায় Project-এর root-এ বসিয়ে দিন। অথবা Full ZIP Extract করে GitHub Repository আপডেট করুন।

## যাচাই

- JavaScript syntax: PASS
- Headless Chromium (Desktop/Mobile) scripted UI interaction: PASS
- ৩৪টি Event সাজেশন পেজিং, রুম/ফ্লোর/মেনু, 1F-এ Room Unknown, 405/407 Joint Listing: PASS
- Production Gemini / Cloudflare connectivity: এই প্যাচে নতুন করে পরীক্ষা করা হয়নি

# TTC FESTIVAL 2026

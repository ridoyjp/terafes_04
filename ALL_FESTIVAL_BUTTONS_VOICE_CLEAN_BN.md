# TTC FESTIVAL 2026 — সব ইভেন্টের আলাদা বাটন ও Voice Symbols Fix

স্কুলের `フロアガイドWK.xlsx`-এ **২১টি প্রকাশিত রেকর্ড/বুথ** আছে। যেসব রেকর্ডে একাধিক কার্যক্রমের নাম আছে সেগুলো পৃথক বাটনে ভাগ করা হয়েছে; সব মিলিয়ে **৩৪টি বাটন**। (এগুলো ৩৪টি পৃথক রুম নয়; কিছু একই রুমের একাধিক কাজ।) প্রত্যেক বাটনে ক্লিক করলে Chat-এ উক্ত কার্যক্রম, ফ্লোর, রুম (শুধু স্কুল যে রুম দিয়েছে), বিভাগ এবং মূল বর্ণনা দেখাবে।

**情報一覧:** ৮টি Category + 全企画 + ১০টি Floor Button + ৩৪টি পৃথক Event Button। উপরের Menu-র フード / ゲーム / 会場案内-ও স্কুল ডেটা থেকে উত্তর দেয়।

**Audio:** Browser SpeechSynthesis-এর আগে একটি পৃথক voice-only টেক্সট স্যানিটাইজার ব্যবহার হয়। এটি Markdown link, URL, emoji, symbols এবং punctuation (`,` `***` `=!|_{}` `。` `、` ইত্যাদি) বাদ দেয়। জাপানি, বাংলা, ইংরেজি ও অন্যান্য ভাষার অক্ষর/সংখ্যা রেখে দেয়। স্বাভাবিক উচ্চারণ ব্রাউজারের ইনস্টল করা voice-এর ওপর নির্ভর করে। Chat-এ লেখা অপরিবর্তিত থাকে। Robot welcome voice-এর জন্যও একই নিয়ম।

**অপরিবর্তিত:** Homepage visual layout, robot CSS/image, mic input, Cloudflare Worker, school Excel, আগের ২১টি তথ্য ও অন্যান্য project files।

**পরিবর্তন:** `script.js`, `index.html`, নতুন test ও এই README। `style.css` পুরোনো অক্ষত। নতুন script cache version দেওয়া আছে।

**Live update:** GitHub Pages-এ updated source files push করতে হবে।

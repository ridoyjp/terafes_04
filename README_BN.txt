TTC GAKUENSAI PRONUNCIATION FIX

আগের voice-এ “Matsuri” শোনানোর কারণ: Welcome TTS-এর চার জায়গায় Kanji 学園祭 ছিল।
এই Patch-এ শুধু WELCOME_SPEECH-এর শোনানোর বাক্যে চারটি জায়গায় がくえんさい রাখা হয়েছে।
Visible Japanese text, site design, AI reply voice, voice typing, Worker / API, welcome looping logic অপরিবর্তিত।

INSTALL — Windows CMD:
1. C:\terafes_04\script.js backup করো।
2. এই ZIP-এর script.js এবং refresh_script_version.cjs ফাইল C:\terafes_04-এ রাখো।
3. চালাও:
   cd /d C:\terafes_04
   node refresh_script_version.cjs
   node --check script.js
   git diff --check
   git diff -- script.js index.html
4. Diff ঠিক থাকলে:
   git add script.js index.html
   git commit -m "Fix Gakuensai welcome speech pronunciation"
   git push origin main
5. GitHub Pages deploy শেষ হওয়ার পরে Ctrl+Shift+R দিয়ে reload করো।

Browser speech engine বিশেষ ক্ষেত্রে pause করতে পারে, কিন্তু hiragana がくえんさい কে matsuri পড়ার কথা নয়।
Loop auto play browser-এর permission/policy-এর ওপর নির্ভরশীল।

# Automatic voice language — Bengali setup

Voice-language dropdown সম্পূর্ণ সরানো হয়েছে। Phone/Browser-এর preferred language দিয়ে Web Speech Recognition শুরু হবে। এটি সত্যিকারের multilingual spoken-language auto detection নয়; Web Speech API একটি locale চায়। অন্য ভাষায় Voice Typing করতে হলে Phone keyboard dictation-এর language ব্যবহার করা ভালো।

## Deploy
1. ZIP থেকে `index.html`, `script.js`, `style.css` ফাইলগুলি `C:\terafes_04`-এ Replace করো।
2. Run: `cd /d C:\terafes_04`
3. Run: `git add index.html script.js style.css`
4. Run: `git commit -m "Remove voice language selector"`
5. Run: `git push origin main`

Backend Worker পরিবর্তন হয়নি। Gemini AI typed প্রশ্নের ভাষায় উত্তর দেওয়ার চেষ্টা করবে। Browser/OS অনুমোদন ও voice recognition language support প্রয়োজন। ChatGPT-like arbitrary spoken language auto detection চাইলে multilingual Speech-to-Text backend লাগবে।

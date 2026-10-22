# ভাষা নির্বাচন ছাড়া Voice Typing

1. ZIP থেকে `script.js` এবং `cloudflare-worker/src/index.js` নিজের Project-এ Replace করো।
2. `cd /d C:\terafes_04\cloudflare-worker` তারপর `npx wrangler deploy`।
3. `cd /d C:\terafes_04` তারপর `git add script.js cloudflare-worker/src/index.js`, `git commit -m "Add automatic multilingual voice transcription"`, `git push origin main`।
4. GitHub Pages HTTPS URL খুলে 🎙️ চাপো, 18 সেকেন্ডের মধ্যে কথা বলো, আবার ⏹ চাপো; কথার ভাষায় Text input box-এ আসবে। যাচাই করে Send করো।

**নতুন API:** Worker `/transcribe` route-এ Audio গ্রহণ করে Gemini `gemini-2.5-flash` মডেলে Transcription করে। Cloudflare Secret `GEMINI_API_KEY` আগের মতো লাগবে। `GEMINI_AUDIO_MODEL` চাইলে আলাদাভাবে কনফিগার করা যায়।

**সতর্কতা:** এই ফিচারে Audio Google Gemini API-তে পাঠানো হয়; ব্যবহারকারীদের জানাও। Free quota বা billing limit প্রযোজ্য। সব ভাষার 100% accuracy নিশ্চিত নয়। ফোনে microphone permission ও secure HTTPS প্রয়োজন। Browser-এ `MediaRecorder` এবং `getUserMedia` না থাকলে Keyboard Dictation ব্যবহার করবে।

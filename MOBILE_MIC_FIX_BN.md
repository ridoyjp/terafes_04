# Mobile Voice Typing Fix — বাংলা গাইড

## চিহ্নিত সমস্যা
- `SpeechRecognition` না থাকলে আগের code মাইক্রোফোন বাটন disable করত।
- Permission / Network / Unsupported language error হলে স্পষ্ট fallback ছিল না।
- `Auto` Language ডিভাইসের ভাষা নেয়; বাংলা বলতে চাইলে `বাংলা (Bengali)` নির্বাচন করো।

## ব্যবহার
1. Website `https://ridoyjp.github.io/terafes_04/` থেকে খোলো (file:// নয়)।
2. iPhone: Settings > Privacy & Security > Microphone-এ Browser permission, Safari site setting-এর Microphone Allow যাচাই করো। Speech Recognition অনুপলব্ধ হলে 🎙️ চাপলে Text Input খুলবে; iPhone Keyboard-এর নিচের Microphone/Dictation চাপো এবং শেষে Send চাপো। Keyboard Dictation Settings > General > Keyboard > Enable Dictation প্রয়োজন হতে পারে।
3. Android Chrome: Site Settings > Microphone > Allow, System app microphone permission Allow। 🎙️ চাপো, Permission Allow করো, কথা বলো। Web Speech Recognition না থাকলে Gboard microphone ব্যবহার করো।
4. বাংলা বললে dropdown-এ `বাংলা (Bengali)`, Japanese হলে `日本語`, English হলে `English` নির্বাচন করো।
5. Device keyboard dictation কেবল device/browser ভাষা support করলে কাজ করবে।

## Deploy
`index.html`, `style.css`, `script.js` একই Layout-এ আছে, শুধু `script.js` ও `style.css` কপি করলেই চলবে।

```bat
cd /d C:\terafes_04
git add script.js style.css
git commit -m "Fix mobile microphone recognition and dictation fallback"
git push origin main
```

Worker বদল হয়নি, Redeploy প্রয়োজন নেই। iOS/Android physical-device verification এখনো হয়নি।

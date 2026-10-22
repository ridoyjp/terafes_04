# TTC 学園祭 AI — Robot Body Glow Update

এই Update-এ Robot-এর নিচের অংশ flat rounded rectangle, Chest Light নরমভাবে Glow/Pulse করবে এবং ৩টি Sparkle একে একে ঝিকমিক করবে। Eye Blink, Talking Mouth, Japanese Voice, Chat ও Cloudflare Worker আগের মতো থাকবে।

## Install (Windows)

1. Design Update ZIP Extract করো।
2. ZIP-এর `index.html`, `robot-body-glow.css`, `assets/hero-robot-flat-glow.png` এবং `tools`-এর ৩টি updated test file তোমার `C:\terafes_04`-এ একই Folder Structure রেখে Copy/Replace করো।
3. আগে Project-এর Backup রাখো।
4. CMD:

```bat
cd /d C:\terafes_04
node tools\smoke-test.mjs
node tools\robot-talk-test.mjs
node tools\responsive-design-test.mjs
node tools\robot-glow-test.mjs
git add index.html robot-body-glow.css assets/hero-robot-flat-glow.png
git diff --cached --check
git diff --cached --stat
git commit -m "Add shimmering robot chest light and flat body"
git push origin main
```

`index.html`-এ আগের কাজ করা Voice এবং Chat Logic বজায় রাখা হয়েছে। Existing `script.js`, `style.css`, Cloudflare Worker পরিবর্তন করা হয়নি। Live iPhone/Safari test বাকি।

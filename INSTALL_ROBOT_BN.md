# TTC Gakuensai Robot Welcome Update

1. Backup existing `index.html`, `script.js`, and `style.css`.
2. Copy these three files into `C:\terafes_04\`.
3. Copy `assets/welcome-robot.png` into `C:\terafes_04\assets\`.
4. In CMD:

```bat
cd /d C:\terafes_04
node --check script.js
git add index.html script.js style.css assets/welcome-robot.png
git diff --cached --check
git commit -m "Add animated Gakuensai welcome robot"
git push origin main
```

5. Wait for GitHub Pages Actions to succeed, then hard-refresh the website. No Worker deployment needed.

Robot eye glow follows mouse slightly, mouth glow and speech rings animate while Japanese welcome TTS is speaking. The original uploaded image is static, so these are layered CSS effects, not true lip-sync. Browsers may require first tap for voice autoplay.

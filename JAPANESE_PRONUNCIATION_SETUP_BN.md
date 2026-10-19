# Japanese Welcome Pronunciation Fix

- Website-এ **AI Chat Bot** লেখা আগের মতোই থাকবে।
- Japanese speech-এ **エーアイ・チャットボット** বলা হবে।
- iPhone Safari / Android Chrome voice fallback, continuous guide, mute, multilingual AI ও school data অপরিবর্তিত।

## Install
1. ZIP Extract করুন।
2. `script.js` কপি করে `C:\terafes_04\script.js` Replace করুন।
3. CMD চালান:

```bat
cd /d C:\terafes_04
git add script.js
git commit -m "Fix Japanese AI Chat Bot welcome pronunciation"
git push origin main
```

Cloudflare Worker redeploy প্রয়োজন নেই। Mobile browsers-এ user gesture ছাড়া autoplay নিশ্চিত করা যায় না।

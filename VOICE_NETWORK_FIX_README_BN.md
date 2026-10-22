# TTC AI Chatbot — Full Project, Mobile Voice Network Patch

- Original school festival UI, Japanese welcome voice, assets, Gemini chat, and multilingual STT retained.
- Recording length limited to 12 seconds for mobile connections.
- A single retry on a network-level fetch error; HTTP errors are NOT retried.
- Clear Japanese diagnostic message on network failure, instead of generic `Failed to fetch`.
- Cache versioning added to `index.html` so GitHub Pages serves matching files.
- No API keys bundled. Cloudflare GEMINI_API_KEY remains a secret.

## Windows installation
Copy all extracted project contents into `C:\terafes_04` ONLY AFTER keeping a backup. To minimize disruption, replace only `script.js` and `index.html` and keep existing Worker. Before overwriting existing index.html, review your local changes.

```
cd /d C:\terafes_04
git add script.js index.html
git commit -m "Improve mobile multilingual voice upload and cache refresh"
git push origin main
```

No Cloudflare deploy is required *if* the previously tested `/transcribe` endpoint remains deployed.

**Note:** `Failed to fetch` can still be caused by iOS/Android browser policies, network, CORS, extensions or unreachable network. The curl 400 test only confirms routing. Test in a real browser after deployment; the patch does not guarantee transcription on every mobile device.

# TTC Chatbot — Cross-device auto-stop voice update

- One tap starts recording, Web Audio is unlocked within the tap handler for mobile Safari.
- When actual speech is detected, about 0.9 seconds of quiet stops recording automatically.
- If AudioContext is suspended/unavailable or noisy environments defeat detection, safety stop ends recordings by 8.5 seconds on phones, 11 seconds on desktop.
- Audio goes to existing Cloudflare /transcribe to automatically detect Bengali, Japanese, English, Nepali, Myanmar, Chinese, and other languages (subject to Gemini accuracy).
- Successful transcription automatically sends via the existing chat route.
- Voice and chat times are logged to browser developer console to isolate backend latency.
- GitHub: replace ONLY script.js in C:\terafes_04, test node --check script.js, stage/commit/push only script.js.
- This does NOT guarantee 1-second transcription or AI answer: Gemini cloud request time is independent of silence detection.
- Test actual Chrome desktop, Android Chrome, Safari iOS; browser microphone permissions require HTTPS.

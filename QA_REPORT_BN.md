# TTC 学園祭 AI — Final Professional V3 QA

Test date: 2026-10-22

- Baseline Project Snapshot: **31/31 Offline Checks PASS**.
- Baseline + V2 applied: **31/31 Offline Checks PASS**.
- Repeat V3 update: **0 additional file changes** (idempotent).
- Frontend, Worker, School Data Module syntax verified by Node.
- School knowledge entries: **35 topics**, including **5 newly curated official-school entries**. Previous 2026 festival `verified:false` entries preserved.
- Original Robot, Chat UI, IDs, Worker Festival Approval Guard, API Secret separation preserved.
- Updated responsive Start Button CSS and best-effort Welcome Voice retry verified statically.
- Browser Autoplay, real iPhone voice, live Cloudflare/Gemini, full UI visual regression, and every school's changing fact **not tested**. Browser policies may require user interaction.
- Before pushing: inspect `git diff`, confirm no secrets, test on real devices, and deploy Worker separately.

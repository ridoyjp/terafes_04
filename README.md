# TTC FESTIVAL 2026 — 学園祭 AI チャットボット (terafes_04)

東京テクニカルカレッジ学園祭の来場者向けガイド。学校から提供された `フロアガイドWK.xlsx` に記載された展示・体験・教室・会場を、文字入力やメニューから案内します。Gemini チャットおよびブラウザー音声機能を利用できます（ブラウザー・ネットワーク・権限により制限があります）。

## 使用するファイル
- `index.html` — Web アプリの入口
- `style.css`, `hero-responsive.css`, `robot-talk.css`, `robot-body-glow.css` — スタイル
- `script.js` — ナビゲーション・チャット・音声・メニュー
- `config.js` — Cloudflare Worker `/chat` エンドポイント（秘密鍵なし）
- `festival-floor-guide.js`, `festival_floor_guide_2026.json`, `フロアガイドWK.xlsx` — 学園祭の学校提供資料
- `cloudflare-worker/src/index.js` — Gemini へのサーバー側 API、CORS、使用量制御、音声文字起こし
- `QA_REVIEW_2026-11-12_BN.md`, `QA_REVIEW_2026-11-12_JP.md` — 今回の検証結果

## 利用・配置
公式 GitHub Pages URL: https://ridoyjp.github.io/terafes_04/

ローカルで `index.html` を直接開いても Web UI・学園祭のローカル情報は利用できますが、`file://` の Origin は Cloudflare Worker に許可されないため、Gemini API を含む機能の実動作確認には HTTPS の公開サイトを使ってください。公開 URL の Origin を変更する場合は Worker 側の CORS 設定も見直す必要があります。

Cloudflare Worker のコードは `cloudflare-worker/` にあります。API キーは Web に書き込まず Worker Secret `GEMINI_API_KEY` として設定してください。任意の環境で `npm ci` と `npm run deploy` を行う前に学校・管理者の権限を確認してください。

## テスト
```bash
node --check script.js
node --check cloudflare-worker/src/index.js
node --test tests/*.test.mjs
```
旧テストの一部は以前のメニュー（削除された検索欄・旧タブなど）を前提としており、現在の UI では失敗します。失敗を無視して全件 PASS と判断しないでください。`QA_REVIEW_2026-11-12_JP.md` の区別を参照してください。

## データの範囲
学校 Excel は 9フロア、21掲載枠です。21掲載枠に含まれる複数の名称を分割して 34企画として表示しています。学校資料に記載のない部屋、料金、全体の開催時間などを推定して案内しません。

# TTC FESTIVAL 2026 — 最終 QA レビュー報告書

**確認日:** 2026年11月12日  
**対象:** TTC_Festival_Single_View_Navigation_Full_Project.zip  
**前提:** ローカルソース、Chromium 画面エミュレーション、模擬音声・模擬ネットワークによる検証。実際の Safari・Android 端末および本番 Gemini API の正常動作を保証するものではありません。

## 結果

| 確認範囲 | 結果 |
|---|---|
| Chromium UI操作（デスクトップ・Android相当・iPhone相当） | 42/42 PASS |
| チャット API リクエスト・音声機能の模擬検証 | 8/8 PASS |
| Cloudflare Worker のルーティング・権限・CORS | 8/8 PASS |
| 学校資料のメニューと場所案内の追加確認 | 7/7 PASS |
| Excel の記載セルと転記データの完全一致 | 60/60セル一致、ファイル SHA-256 一致 |
| 既存の自動テストスイート | **21 PASS / 20 FAIL（41件）** |
| JavaScript構文、ZIP破損チェック | PASS |

## 確認した機能

- ホーム画面、Festival ロゴ、ゲーム・フード・フロア案内用 SVG アイコン
- Start Now、ホームに戻る、情報一覧の開閉、5カテゴリへ戻す、カテゴリ切り替え
- 9階層・21掲載枠・34企画、5F 501号室を含む教室案内
- 画面幅1366px / 393px / 390pxでの動作、横スクロールなし
- チャット・音声読み上げ文字列からの不要記号除去
- CORS 許可 Origin と拒否 Origin、管理者用認証、不正な API リクエスト

## 課題

1. **既存テスト20件が失敗。** 旧検索欄・旧フロアタブ・以前の DOM 要素／CSS バージョンを前提とするテストが残っています。現行画面に合わせて再作成が必要です。すべてアプリケーション不具合と断定できるわけではありません。
2. **README.mdに旧プロジェクト名が記載されていたため修正。** 本レビュー版に新しい説明を同梱しました。
3. **本番接続未検証。** Cloudflare Worker `/chat`・`/transcribe`、実 Gemini API 応答、利用量上限、実 Android / iPhone Safari マイク・読み上げ・音声再生は確認できていません。
4. **`file://` では API が利用できません。** Cloudflare Worker の許可 Origin は GitHub Pages です。実際の API の確認には HTTPS 公開サイトが必要です。

## 評価

**学校 Excel ベースの画面・ナビゲーション:** エミュレーション環境では合格。  
**本番 AI・音声:** 未検証。  
**既存テストスイート:** 要更新（全件 PASS と報告しないこと）。

変更したもの：`README.md` と QA ドキュメントのみ。画面・音声・Worker の実行コードおよび学校 Excel は変更していません。

Google 参考資料: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite

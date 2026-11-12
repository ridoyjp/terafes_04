# TTC 学園祭AIチャットボット — 一般質問・学校案内のルーティング修正

**更新日**：2026年11月12日

## 修正内容

従来は「東京のおいしい食べ物は何ですか」のような一般質問を、単語「食べ物」だけで学園祭のフロアガイドと誤判定することがありました。現在は、**具体的な学園祭・教室・企画の質問**のみフロアガイドに回し、それ以外は通常の Gemini 応答へ送ります。

- 学園祭について：学校提供の2026年フロアガイドを優先。未記載の日時や部屋番号を捏造しません。
- 学校について：東京テクニカルカレッジの学科、授業、教員、入学、学費、奨学金、就職、歴史などについて、2026年11月12日に確認した公開情報を Gemini の根拠として使用。
- その他の質問：旅行、料理、プログラミング、一般知識などは通常の Gemini で回答。

## 注意事項

このデータは**公式サイトの主要公開ページからまとめたスナップショット**であり、サイト内全ページをリアルタイムに検索するものではありません。未公開の教員一覧や個別授業担当者は回答を断定しません。学費が全員無償という事実はなく、要件を満たす場合に減免・奨学金制度があります。就職も全員への将来保証ではありません。

公式参照先：

- https://tec.ttc.ac.jp/school/
- https://tec.ttc.ac.jp/school/history/
- https://tec.ttc.ac.jp/departments/
- https://tec.ttc.ac.jp/departments/it-game-web/data-processing/curriculum/
- https://tec.ttc.ac.jp/entrance/expenses/
- https://tec.ttc.ac.jp/entrance/scholarship/
- https://tec.ttc.ac.jp/entrance/koutou-syugakushien/
- https://tec.ttc.ac.jp/recruit/support/
- https://tec.ttc.ac.jp/entrance/schedule/
- https://search.tsk.or.jp/search/viewnl.php?id=110031

**テスト**：37/37 ルーティングテスト合格（Gemini外部APIはモック）。実際のGemini API応答、スマートフォンの音声、Cloudflare本番接続は未確認。GitHub PagesとCloudflare Workerの両方をデプロイしてください。

# CLAUDE.md

Claude Code は最初に `AGENTS.md` を読んでください。ここには Claude 固有の補足だけを書きます。

## Claude 固有メモ

- `~/.claude/settings.json` の `Stop` hook は README にあるユーザー設定であり、リポジトリ内の設定ファイルではありません
- `.claude/settings.local.json` はローカル環境用の補助設定です。通常の機能変更では編集しません
- hook 手順やトリガー方式を変えるなら、`README.md` と `DESIGN.md` の両方を確認してください
- `memo.md` に将来案はありますが、ユーザーから明示されない限り実装済み仕様として扱わないでください

## このリポジトリでの進め方

- 小さく変更して、README と実装の整合性を最後に確認する
- 表示文言を変えるときは、日本語の自然さを優先する

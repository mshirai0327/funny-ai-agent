# AGENTS.md

このリポジトリで作業する AI エージェント向けの共有ガイドです。Claude Code と Codex は、まずこのファイルを読んでから作業してください。

## プロダクト概要

- プロダクト名は `Claude Notify`
- 現在の正式な実装は VS Code 拡張機能
- 目的は、AI エージェントや VS Code タスクの完了時に、かわいいキャラクターのポップアップを表示すること

## 現在の実装の要点

- 拡張の本体は `src/extension.js`
- `~/.claude/notify-trigger` の更新や作成を `createFileSystemWatcher` で監視して通知を出す
- `vscode.tasks.onDidEndTask` でも VS Code タスク完了を検知する
- 表示は Webview パネルで行う。ネイティブ通知ではない
- キャラクター定義、配色、SVG、メッセージは `src/extension.js` にまとまっている

## 参照順序

仕様や挙動を判断するときは、次の順で見ること。

1. `src/extension.js`
2. `package.json`
3. `README.md`
4. `DESIGN.md`

補足:

- `README.md` はユーザー向けのセットアップ手順と公開挙動の説明
- `DESIGN.md` はファイル監視方式に切り替えた背景と設計意図
- `memo.md` は作業メモや将来案を含むため、通常は source of truth として扱わない

## リポジトリ構成

- `src/extension.js`: 拡張のエントリポイントと UI 実装
- `package.json`: 拡張メタデータ、コマンド、設定項目、スクリプト
- `README.md`: インストール手順、Claude Code hook 設定、ユーザー向け説明
- `DESIGN.md`: 現行方式の設計メモ
- `.vscode/launch.json`: Extension Development Host 用の起動設定

## 変更時のガードレール

- このリポジトリは現時点では Electron アプリではない。将来案を実装済み前提で扱わない
- VS Code の Proposed API を再導入しない。現行設計は安定 API 前提
- 設定キーを変更したら `package.json` と `README.md` を必ずそろえる
- 通知トリガーの仕組みを変えたら `README.md` と `DESIGN.md` も更新する
- UI テキストやドキュメントは日本語を優先し、既存のやわらかいトーンを保つ
- 3キャラクターの見た目や名前を変えるときは、意図がない限り既存の個性を残す

## 開発フロー

- 依存関係のインストール: `npm ci`
- 拡張の簡易確認: VS Code で `F5` を押して Extension Development Host を起動
- ポップアップ確認: コマンドパレットで `Claude Notify: Test Popup`
- パッケージ確認: `vsce package` または `npx @vscode/vsce package`

注意:

- `npm run lint` は現状プレースホルダーで、実質的な静的解析は未整備
- 自動テストはまだないので、変更後は手動確認まで含めて考える

## 変更後チェック

- 実装と README の説明がずれていない
- `package.json` の設定項目と実装が一致している
- 手動確認の手順を説明できる
- 将来案ではなく、現行実装に基づいた説明になっている

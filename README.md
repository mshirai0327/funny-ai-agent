# Claude Notify

AIエージェント（Claude Code / Codex等）のタスク完了時に、かわいいアニメキャラクターのポップアップ通知を表示するVSCode拡張機能。

## キャラクター

| ID | 名前 | カラー | 特徴 |
|----|------|--------|------|
| hana | ハナ | #FF6B9D | ピンク・アホ毛・ショートヘア女の子 |
| kira | キラ | #6B8FFF | ブルー・ギザ前髪・元気系 |
| mochi | もち | #7BC67B | 緑・ねこ耳・まるっこい |

## インストール

```bash
# 直接コピー（開発用）
cp -r claude-notify ~/.vscode/extensions/
# VSCode再起動後に有効化

# または VSIX パッケージ化
npm install -g @vscode/vsce
cd claude-notify && vsce package
# .vsix が生成される → Extensions: Install from VSIX
```

## テスト

`Ctrl+Shift+P` → **Claude Notify: Test Popup** でポップアップ確認。

F5 でExtension Development Hostを起動してデバッグ可能。

## 設定

| キー | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `claudeNotify.character` | string | `"random"` | 表示キャラ（hana/kira/mochi/random）|
| `claudeNotify.displayDuration` | number | `5000` | 表示時間（ミリ秒）|
| `claudeNotify.triggerPatterns` | array | 下記参照 | 検知する文字列パターン |

### デフォルトトリガーパターン

```json
["✓ Completed", "Task completed", "All done", "Cost:", "claude> $", "> Task complete"]
```

## 仕組み

- `onDidWriteTerminalData` — ターミナル出力を監視してパターンマッチ
- `onDidEndTask` — VSCodeタスク完了イベントを監視
- Webviewパネルで SVG アニメーション付きポップアップを表示（自動クローズ）

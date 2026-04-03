# Claude Notify — 設計ドキュメント（案B実装用）

## 目的

VSCode拡張機能「Claude Notify」のターミナル監視方式を、Proposed API不要のファイル監視方式に切り替える。

現在の問題：`onDidWriteTerminalData` は VSCode の Proposed API であり、通常インストール（VSIX）では動作しない。

---

## 変更概要

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| トリガー検知 | `onDidWriteTerminalData`（Proposed API） | `createFileSystemWatcher`（安定API）|
| Claude側設定 | 不要 | `~/.claude/settings.json` に `Stop` hook を追記 |
| パッケージ化 | 開発モード限定 | VSIX化して通常インストール可能 |

---

## 仕組み

```
Claude Code がタスクを完了
        ↓
~/.claude/settings.json の Stop hook が発火
        ↓
シェルコマンド: touch ~/.claude/notify-trigger
        ↓
VSCode拡張機能の FileSystemWatcher が変更を検知
        ↓
ポップアップ表示
```

---

## Claude Code の hook 設定（ユーザーが手動で設定）

`~/.claude/settings.json` に以下を追記する：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "touch ~/.claude/notify-trigger"
          }
        ]
      }
    ]
  }
}
```

- `Stop` イベント：Claude Code がエージェントとしての応答を完了したタイミングで発火
- `touch` コマンドでセンチネルファイルのタイムスタンプを更新する

---

## src/extension.js の変更仕様

### 削除するもの

- `extractMessage()` 関数（不要になる）
- `activate()` 内の `onDidWriteTerminalData` 監視ブロック（L248〜L261）
- `package.json` の `enabledApiProposals: ["terminalDataWriteEvent"]`
- `.vscode/launch.json` の `--enable-proposed-api` フラグ

### 追加するもの

`activate()` 内に以下を追加：

```javascript
const os = require('os');
const path = require('path');

const triggerFilePath = path.join(os.homedir(), '.claude', 'notify-trigger');
const triggerFileUri = vscode.Uri.file(triggerFilePath);

const watcher = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(
    vscode.Uri.file(path.dirname(triggerFilePath)),
    path.basename(triggerFilePath)
  )
);

watcher.onDidChange(() => showPopup(context, ''));
watcher.onDidCreate(() => showPopup(context, ''));
context.subscriptions.push(watcher);
```

### 変更しないもの

- `CHARACTERS` / `MESSAGES` 定数（そのまま）
- `getCharacter()` / `buildWebviewHtml()` / `showPopup()` 関数（そのまま）
- `onDidEndTask` 監視ブロック（VSCodeタスク完了も引き続き検知する）
- `claudeNotify.testPopup` コマンド（そのまま）

---

## package.json の変更仕様

- `enabledApiProposals` フィールドを丸ごと削除する

```json
// 削除
"enabledApiProposals": [
  "terminalDataWriteEvent"
],
```

- `triggerPatterns` 設定項目も不要になるため削除する

---

## .vscode/launch.json の変更仕様

- `--enable-proposed-api=undefined_publisher.claude-notify` の行を削除する

---

## README.md の変更仕様

### インストール手順に追記

```
## Claude Code hook の設定（必須）

~/.claude/settings.json に以下を追記してください：

{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "touch ~/.claude/notify-trigger" }]
      }
    ]
  }
}
```

### 削除

- トリガーパターン設定の説明
- Proposed API に関する注記

---

## ファイル変更一覧

| ファイル | 変更種別 |
|---------|---------|
| `src/extension.js` | 修正（onDidWriteTerminalData 削除・FileSystemWatcher 追加） |
| `package.json` | 修正（enabledApiProposals・triggerPatterns 削除） |
| `.vscode/launch.json` | 修正（--enable-proposed-api フラグ削除） |
| `README.md` | 修正（hook 設定手順を追加） |

# Claude Notify

AIエージェント（Claude Code / Codex等）のタスク完了時に、かわいいアニメキャラクターのポップアップ通知を表示するVSCode拡張機能。

## キャラクター

| ID | 名前 | カラー | 特徴 |
|----|------|--------|------|
| hana | ハナ | #FF6B9D | ピンク・アホ毛・ショートヘア女の子 |
| kira | キラ | #6B8FFF | ブルー・ギザ前髪・元気系 |
| mochi | もち | #7BC67B | 緑・ねこ耳・まるっこい |

## インストール

F5 はデバッグ用です。通常の VS Code で使うだけなら、以下のどちらかで有効化できます。

### 方法1: ローカル拡張として配置する（F5不要）

```bash
mkdir -p ~/.vscode/extensions

# どちらか一方を実行
cp -r /path/to/this/repo ~/.vscode/extensions/claude-notify
ln -s /path/to/this/repo ~/.vscode/extensions/claude-notify
```

配置後に VS Code を再起動するか、`Developer: Reload Window` を実行すると有効になります。

### 方法2: VSIX としてインストールする（F5不要）

```bash
npm install -g @vscode/vsce
cd /path/to/this/repo
vsce package
code --install-extension claude-notify-0.1.0.vsix
```

または VS Code の `Extensions: Install from VSIX...` から `.vsix` を選んでもインストールできます。

## テスト

`Ctrl+Shift+P` → **Claude Notify: Test Popup** でポップアップ確認。

F5 は Extension Development Host を起動するデバッグ用の手順です。普段使いでは不要です。

## Claude Code hook の設定（必須）

`~/.claude/settings.json` に `Stop` hook を追加してください。

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

Claude Code の応答完了時に `~/.claude/notify-trigger` が更新され、VSCode 拡張がそれを検知してポップアップを表示します。

## 設定

| キー | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `claudeNotify.character` | string | `"random"` | 表示キャラ（hana/kira/mochi/random）|
| `claudeNotify.displayDuration` | number | `5000` | 表示時間（ミリ秒）|

## 仕組み

- `createFileSystemWatcher` — `~/.claude/notify-trigger` の更新を監視
- `onDidEndTask` — VSCodeタスク完了イベントを監視
- Webviewパネルで SVG アニメーション付きポップアップを表示（自動クローズ）

# Claude Notify

AIエージェント（Claude Code / Codex等）のタスク完了時に、かわいいアニメキャラクターのポップアップ通知を表示するVSCode拡張機能。

## キャラクター

| ID | 名前 | カラー | 特徴 |
|----|------|--------|------|
| hana | ハナ | #FF6B9D | ピンク・アホ毛・ショートヘア女の子 |
| kira | キラ | #6B8FFF | ブルー・ギザ前髪・元気系 |
| mochi | もち | #7BC67B | 緑・ねこ耳・まるっこい |

## 構成

```
VSCode拡張 ──HTTP POST──▶ Electronトレイアプリ ──▶ 透過ポップアップ
              port 39234
```

VSCode拡張はトリガーを検知したら `localhost:39234/notify` にPOSTするだけです。
ポップアップの描画はElectronアプリが担当します。

## セットアップ

### 1. Electronアプリを起動する

```bash
cd claude-notify-app
npm install
npm start
```

起動するとシステムトレイに常駐します。OSログイン時の自動起動も設定されます。

### 2. VSCode拡張をインストールする

[Releases](../../releases) から最新の `.vsix` をダウンロードして、

```bash
code --install-extension claude-notify-x.x.x.vsix
```

または VS Code の `Extensions: Install from VSIX...` から選択。

<details>
<summary>ローカルリポジトリから直接インストールする場合</summary>

```bash
# シンボリックリンクで配置（開発用）
ln -s /path/to/this/repo ~/.vscode/extensions/claude-notify

# または VSIX をローカルビルド
npm install -g @vscode/vsce
vsce package
code --install-extension claude-notify-0.1.0.vsix
```

</details>

### 3. Claude Code hook を設定する（必須）

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

## テスト

`Ctrl+Shift+P` → **Claude Notify: Test Popup** でポップアップを確認できます。

またはElectronのトレイアイコンを右クリック → **テスト通知** からも確認できます。

## 設定

| キー | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `claudeNotify.character` | string | `"random"` | 表示キャラ（hana/kira/mochi/random）|
| `claudeNotify.displayDuration` | number | `5000` | 表示時間（ミリ秒）※Electron側で管理 |

## 仕組み

- VSCode拡張は `~/.claude/notify-trigger` の更新と VSCode タスク完了を監視し、Electron アプリに HTTP POST を送るだけ
- Electron アプリは常駐してHTTPを受け付け、透過・フレームレスのポップアップウィンドウを画面右下に表示する
- Electron アプリ単体でも `~/.claude/notify-trigger` を監視しているため、VSCode を使わない環境（CLI等）でも通知できる

const vscode = require('vscode');

// Character definitions
const CHARACTERS = {
  hana: {
    name: 'ハナ',
    color: '#FF6B9D',
    svg: `
      <circle cx="50" cy="40" r="28" fill="#FFE0EE" stroke="#FF6B9D" stroke-width="2"/>
      <!-- ahoge -->
      <path d="M50 12 Q55 2 52 0 Q48 2 50 12" fill="#8B2252" stroke="#8B2252" stroke-width="1"/>
      <!-- short hair -->
      <path d="M22 38 Q20 20 50 15 Q80 20 78 38 Q75 55 50 58 Q25 55 22 38Z" fill="#8B2252"/>
      <!-- face area -->
      <ellipse cx="50" cy="42" rx="22" ry="20" fill="#FFE0EE"/>
      <!-- eyes -->
      <ellipse cx="41" cy="40" rx="4" ry="5" fill="#FF6B9D"/>
      <ellipse cx="59" cy="40" rx="4" ry="5" fill="#FF6B9D"/>
      <circle cx="41" cy="39" r="1.5" fill="white"/>
      <circle cx="59" cy="39" r="1.5" fill="white"/>
      <!-- blush -->
      <ellipse cx="35" cy="46" rx="5" ry="3" fill="#FFB3CC" opacity="0.6"/>
      <ellipse cx="65" cy="46" rx="5" ry="3" fill="#FFB3CC" opacity="0.6"/>
      <!-- smile -->
      <path d="M43 50 Q50 56 57 50" stroke="#FF6B9D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- body -->
      <rect x="35" y="68" width="30" height="22" rx="5" fill="#FF6B9D"/>
      <!-- arms -->
      <rect x="20" y="70" width="15" height="8" rx="4" fill="#FF6B9D"/>
      <rect x="65" y="70" width="15" height="8" rx="4" fill="#FF6B9D"/>
    `
  },
  kira: {
    name: 'キラ',
    color: '#6B8FFF',
    svg: `
      <circle cx="50" cy="40" r="28" fill="#E0E8FF" stroke="#6B8FFF" stroke-width="2"/>
      <!-- spiky hair -->
      <path d="M22 35 Q18 15 28 10 Q32 8 30 18 Q38 5 42 12 Q46 2 50 8 Q54 2 58 12 Q62 5 70 18 Q68 8 72 10 Q82 15 78 35" fill="#2233AA"/>
      <!-- face area -->
      <ellipse cx="50" cy="42" rx="22" ry="20" fill="#E0E8FF"/>
      <!-- energetic slanted eyes -->
      <path d="M37 37 L45 39" stroke="#6B8FFF" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 39 L63 37" stroke="#6B8FFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="41" cy="38" r="3" fill="#6B8FFF"/>
      <circle cx="59" cy="38" r="3" fill="#6B8FFF"/>
      <circle cx="41" cy="37" r="1" fill="white"/>
      <circle cx="59" cy="37" r="1" fill="white"/>
      <!-- blush -->
      <ellipse cx="35" cy="46" rx="5" ry="3" fill="#B3C3FF" opacity="0.6"/>
      <ellipse cx="65" cy="46" rx="5" ry="3" fill="#B3C3FF" opacity="0.6"/>
      <!-- big grin -->
      <path d="M40 50 Q50 58 60 50" stroke="#6B8FFF" stroke-width="2" fill="#FFB3B3" stroke-linecap="round"/>
      <!-- body -->
      <rect x="35" y="68" width="30" height="22" rx="5" fill="#6B8FFF"/>
      <!-- arms raised in excitement -->
      <rect x="18" y="60" width="17" height="8" rx="4" fill="#6B8FFF" transform="rotate(-30 26 64)"/>
      <rect x="65" y="60" width="17" height="8" rx="4" fill="#6B8FFF" transform="rotate(30 74 64)"/>
    `
  },
  mochi: {
    name: 'もち',
    color: '#7BC67B',
    svg: `
      <!-- rounded body blob -->
      <ellipse cx="50" cy="48" rx="32" ry="30" fill="#C8EEC8" stroke="#7BC67B" stroke-width="2"/>
      <!-- cat ears -->
      <polygon points="24,25 18,8 34,20" fill="#7BC67B"/>
      <polygon points="76,25 82,8 66,20" fill="#7BC67B"/>
      <polygon points="26,23 21,12 32,20" fill="#FFB3CC"/>
      <polygon points="74,23 79,12 68,20" fill="#FFB3CC"/>
      <!-- face -->
      <ellipse cx="50" cy="48" rx="24" ry="22" fill="#E8F8E8"/>
      <!-- round sleepy eyes -->
      <ellipse cx="41" cy="44" rx="5" ry="5.5" fill="#7BC67B"/>
      <ellipse cx="59" cy="44" rx="5" ry="5.5" fill="#7BC67B"/>
      <circle cx="41" cy="43" r="2" fill="white"/>
      <circle cx="59" cy="43" r="2" fill="white"/>
      <!-- cat nose -->
      <ellipse cx="50" cy="51" rx="2.5" ry="2" fill="#FF9999"/>
      <!-- cat whiskers -->
      <line x1="30" y1="50" x2="45" y2="52" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="30" y1="54" x2="45" y2="54" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="55" y1="52" x2="70" y2="50" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="55" y1="54" x2="70" y2="54" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <!-- w mouth -->
      <path d="M44 57 Q47 61 50 57 Q53 61 56 57" stroke="#7BC67B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- stubby arms -->
      <ellipse cx="24" cy="68" rx="10" ry="8" fill="#C8EEC8" stroke="#7BC67B" stroke-width="1.5"/>
      <ellipse cx="76" cy="68" rx="10" ry="8" fill="#C8EEC8" stroke="#7BC67B" stroke-width="1.5"/>
    `
  }
};

const MESSAGES = [
  'タスク完了だよ！',
  'お疲れさまでした！',
  'やったね！完了！',
  'ばっちり終わったよ！',
  'すごい！完成！',
];

function getCharacter(config) {
  const choice = config.get('character', 'random');
  if (choice === 'random') {
    const keys = Object.keys(CHARACTERS);
    return CHARACTERS[keys[Math.floor(Math.random() * keys.length)]];
  }
  return CHARACTERS[choice] || CHARACTERS.hana;
}

function extractMessage(raw) {
  // Strip ANSI escape codes
  return raw.replace(/\x1b\[[0-9;]*[mGKHF]/g, '').trim();
}

function buildWebviewHtml(character, message, duration) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Segoe UI', sans-serif;
    overflow: hidden;
  }
  .card {
    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
    border: 2px solid ${character.color};
    border-radius: 16px;
    padding: 24px 32px;
    text-align: center;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 24px ${character.color}66;
    max-width: 320px;
    width: 100%;
  }
  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .bounce {
    animation: bounce 1.2s ease-in-out infinite;
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  svg { display: block; margin: 0 auto; }
  .name {
    color: ${character.color};
    font-size: 1.1em;
    font-weight: bold;
    margin-top: 8px;
  }
  .message {
    color: #e0e0f0;
    font-size: 1.2em;
    margin-top: 10px;
    font-weight: 600;
  }
  .trigger {
    color: #888aaa;
    font-size: 0.78em;
    margin-top: 8px;
    word-break: break-all;
  }
  .progress {
    margin-top: 14px;
    height: 4px;
    background: #333355;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: ${character.color};
    border-radius: 2px;
    animation: shrink ${duration}ms linear forwards;
  }
  @keyframes shrink {
    from { width: 100%; }
    to   { width: 0%; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="bounce">
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${character.svg}
    </svg>
  </div>
  <div class="name">${character.name}</div>
  <div class="message">${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}</div>
  ${message ? `<div class="trigger">${message}</div>` : ''}
  <div class="progress"><div class="progress-bar"></div></div>
</div>
<script>
  setTimeout(() => {
    const vscode = acquireVsCodeApi();
    vscode.postMessage({ command: 'close' });
  }, ${duration});
</script>
</body>
</html>`;
}

function showPopup(context, triggerText) {
  const config = vscode.workspace.getConfiguration('claudeNotify');
  const character = getCharacter(config);
  const duration = config.get('displayDuration', 5000);

  const panel = vscode.window.createWebviewPanel(
    'claudeNotify',
    `${character.name} says hi!`,
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: false }
  );

  panel.webview.html = buildWebviewHtml(character, triggerText, duration);

  panel.webview.onDidReceiveMessage(
    msg => { if (msg.command === 'close') panel.dispose(); },
    undefined,
    context.subscriptions
  );

  // Fallback auto-close in case postMessage fails
  setTimeout(() => {
    try { panel.dispose(); } catch (_) {}
  }, duration + 500);
}

function activate(context) {
  // Command: manual test
  const testCmd = vscode.commands.registerCommand('claudeNotify.testPopup', () => {
    showPopup(context, 'Test trigger from command palette');
  });
  context.subscriptions.push(testCmd);

  // Watch terminal output
  const termDisposable = vscode.window.onDidWriteTerminalData(event => {
    const config = vscode.workspace.getConfiguration('claudeNotify');
    const patterns = config.get('triggerPatterns', []);
    const text = extractMessage(event.data);

    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        showPopup(context, text.substring(0, 80));
        break;
      }
    }
  });
  context.subscriptions.push(termDisposable);

  // Watch VSCode task completion
  const taskDisposable = vscode.tasks.onDidEndTask(event => {
    const name = event.execution.task.name;
    showPopup(context, `Task "${name}" finished`);
  });
  context.subscriptions.push(taskDisposable);
}

function deactivate() {}

module.exports = { activate, deactivate };

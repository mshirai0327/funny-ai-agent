const { app, Tray, Menu, BrowserWindow, nativeImage, screen } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const PORT = 39234;
const TRIGGER_FILE = path.join(os.homedir(), '.claude', 'notify-trigger');
const POPUP_DURATION = 6000;

const CHARACTERS = {
  hana: {
    name: 'ハナ',
    color: '#FF6B9D',
    svg: `
      <circle cx="50" cy="40" r="28" fill="#FFE0EE" stroke="#FF6B9D" stroke-width="2"/>
      <path d="M50 12 Q55 2 52 0 Q48 2 50 12" fill="#8B2252" stroke="#8B2252" stroke-width="1"/>
      <path d="M22 38 Q20 20 50 15 Q80 20 78 38 Q75 55 50 58 Q25 55 22 38Z" fill="#8B2252"/>
      <ellipse cx="50" cy="42" rx="22" ry="20" fill="#FFE0EE"/>
      <ellipse cx="41" cy="40" rx="4" ry="5" fill="#FF6B9D"/>
      <ellipse cx="59" cy="40" rx="4" ry="5" fill="#FF6B9D"/>
      <circle cx="41" cy="39" r="1.5" fill="white"/>
      <circle cx="59" cy="39" r="1.5" fill="white"/>
      <ellipse cx="35" cy="46" rx="5" ry="3" fill="#FFB3CC" opacity="0.6"/>
      <ellipse cx="65" cy="46" rx="5" ry="3" fill="#FFB3CC" opacity="0.6"/>
      <path d="M43 50 Q50 56 57 50" stroke="#FF6B9D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="35" y="68" width="30" height="22" rx="5" fill="#FF6B9D"/>
      <rect x="20" y="70" width="15" height="8" rx="4" fill="#FF6B9D"/>
      <rect x="65" y="70" width="15" height="8" rx="4" fill="#FF6B9D"/>
    `
  },
  kira: {
    name: 'キラ',
    color: '#6B8FFF',
    svg: `
      <circle cx="50" cy="40" r="28" fill="#E0E8FF" stroke="#6B8FFF" stroke-width="2"/>
      <path d="M22 35 Q18 15 28 10 Q32 8 30 18 Q38 5 42 12 Q46 2 50 8 Q54 2 58 12 Q62 5 70 18 Q68 8 72 10 Q82 15 78 35" fill="#2233AA"/>
      <ellipse cx="50" cy="42" rx="22" ry="20" fill="#E0E8FF"/>
      <path d="M37 37 L45 39" stroke="#6B8FFF" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 39 L63 37" stroke="#6B8FFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="41" cy="38" r="3" fill="#6B8FFF"/>
      <circle cx="59" cy="38" r="3" fill="#6B8FFF"/>
      <circle cx="41" cy="37" r="1" fill="white"/>
      <circle cx="59" cy="37" r="1" fill="white"/>
      <ellipse cx="35" cy="46" rx="5" ry="3" fill="#B3C3FF" opacity="0.6"/>
      <ellipse cx="65" cy="46" rx="5" ry="3" fill="#B3C3FF" opacity="0.6"/>
      <path d="M40 50 Q50 58 60 50" stroke="#6B8FFF" stroke-width="2" fill="#FFB3B3" stroke-linecap="round"/>
      <rect x="35" y="68" width="30" height="22" rx="5" fill="#6B8FFF"/>
      <rect x="18" y="60" width="17" height="8" rx="4" fill="#6B8FFF" transform="rotate(-30 26 64)"/>
      <rect x="65" y="60" width="17" height="8" rx="4" fill="#6B8FFF" transform="rotate(30 74 64)"/>
    `
  },
  mochi: {
    name: 'もち',
    color: '#7BC67B',
    svg: `
      <ellipse cx="50" cy="48" rx="32" ry="30" fill="#C8EEC8" stroke="#7BC67B" stroke-width="2"/>
      <polygon points="24,25 18,8 34,20" fill="#7BC67B"/>
      <polygon points="76,25 82,8 66,20" fill="#7BC67B"/>
      <polygon points="26,23 21,12 32,20" fill="#FFB3CC"/>
      <polygon points="74,23 79,12 68,20" fill="#FFB3CC"/>
      <ellipse cx="50" cy="48" rx="24" ry="22" fill="#E8F8E8"/>
      <ellipse cx="41" cy="44" rx="5" ry="5.5" fill="#7BC67B"/>
      <ellipse cx="59" cy="44" rx="5" ry="5.5" fill="#7BC67B"/>
      <circle cx="41" cy="43" r="2" fill="white"/>
      <circle cx="59" cy="43" r="2" fill="white"/>
      <ellipse cx="50" cy="51" rx="2.5" ry="2" fill="#FF9999"/>
      <line x1="30" y1="50" x2="45" y2="52" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="30" y1="54" x2="45" y2="54" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="55" y1="52" x2="70" y2="50" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <line x1="55" y1="54" x2="70" y2="54" stroke="#7BC67B" stroke-width="1.2" opacity="0.7"/>
      <path d="M44 57 Q47 61 50 57 Q53 61 56 57" stroke="#7BC67B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
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

let tray = null;
let popupWindows = [];
// Debounce: track last HTTP notification time to suppress duplicate file-watcher triggers
let lastHttpNotifyTime = 0;

function getCharacterKey(name) {
  const keys = Object.keys(CHARACTERS);
  if (!name || name === 'random') return keys[Math.floor(Math.random() * keys.length)];
  return keys.includes(name) ? name : 'hana';
}

function showPopup(charName, triggerText) {
  const key = getCharacterKey(charName);
  const char = CHARACTERS[key];
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 340, winH = 260;

  const win = new BrowserWindow({
    width: winW,
    height: winH,
    x: sw - winW - 20,
    y: sh - winH - 60,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      devTools: false,
    }
  });

  win.loadFile(path.join(__dirname, 'popup.html'), {
    query: {
      character: key,
      name: char.name,
      color: char.color,
      message,
      triggerText: triggerText || '',
      duration: String(POPUP_DURATION),
    }
  });

  setTimeout(() => {
    try { win.close(); } catch (_) {}
  }, POPUP_DURATION + 500);

  popupWindows.push(win);
  win.on('closed', () => {
    popupWindows = popupWindows.filter(w => w !== win);
  });
}

function startHttpServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/notify') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        lastHttpNotifyTime = Date.now();
        try {
          const data = body ? JSON.parse(body) : {};
          showPopup(data.character, data.message);
        } catch (_) {
          showPopup(null, '');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Claude Notify listening on port ${PORT}`);
  });

  server.on('error', err => {
    console.error('HTTP server error:', err.message);
  });
}

function startFileWatcher() {
  const dir = path.dirname(TRIGGER_FILE);
  if (!fs.existsSync(dir)) return;

  let lastTrigger = 0;

  fs.watch(dir, (event, filename) => {
    if (filename !== path.basename(TRIGGER_FILE)) return;

    const now = Date.now();
    // Debounce: skip if triggered too soon, or if HTTP just came in (VSCode extension already handled it)
    if (now - lastTrigger < 1000) return;
    if (now - lastHttpNotifyTime < 1000) return;
    lastTrigger = now;

    showPopup(null, '');
  });
}

app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: true });

  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (_) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Claude Notify');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'テスト通知', click: () => showPopup(null, 'テスト') },
    { type: 'separator' },
    { label: '終了', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);

  startHttpServer();
  startFileWatcher();
});

// Keep app alive even when all popup windows are closed
app.on('window-all-closed', () => {});

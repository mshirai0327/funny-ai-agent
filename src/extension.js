const os = require('os');
const path = require('path');
const http = require('http');
const vscode = require('vscode');

const PORT = 39234;

function sendToElectron(character, triggerText) {
  const body = JSON.stringify({ character, message: triggerText || '' });
  const req = http.request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/notify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  });
  req.on('error', () => {}); // silently ignore if Electron app is not running
  req.write(body);
  req.end();
}

function activate(context) {
  // Command: manual test
  const testCmd = vscode.commands.registerCommand('claudeNotify.testPopup', () => {
    const config = vscode.workspace.getConfiguration('claudeNotify');
    sendToElectron(config.get('character', 'random'), 'Test from VS Code');
  });
  context.subscriptions.push(testCmd);

  // Watch the Claude Code sentinel file touched by the Stop hook
  const triggerFilePath = path.join(os.homedir(), '.claude', 'notify-trigger');
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.Uri.file(path.dirname(triggerFilePath)),
      path.basename(triggerFilePath)
    )
  );

  const onTrigger = () => {
    const config = vscode.workspace.getConfiguration('claudeNotify');
    sendToElectron(config.get('character', 'random'), '');
  };

  watcher.onDidChange(onTrigger);
  watcher.onDidCreate(onTrigger);
  context.subscriptions.push(watcher);

  // Watch VSCode task completion
  const taskDisposable = vscode.tasks.onDidEndTask(event => {
    const config = vscode.workspace.getConfiguration('claudeNotify');
    sendToElectron(config.get('character', 'random'), `Task "${event.execution.task.name}" finished`);
  });
  context.subscriptions.push(taskDisposable);
}

function deactivate() {}

module.exports = { activate, deactivate };

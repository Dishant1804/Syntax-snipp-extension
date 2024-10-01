const vscode = require('vscode');
const { authenticate } = require('./authenticate.js');
const { TokenManager } = require('./TokenManager.js');


function activate(context) {
  TokenManager.globalState = context.globalState;

  const token = TokenManager.getToken();

  if (!token) {
    vscode.window.showInformationMessage('Welcome to syntax-snipp! Please login to continue.', 'Login')
      .then(selection => {
        if (selection === 'Login') {
          authenticate(() => {
            const newToken = TokenManager.getToken();
            if (newToken) {
              vscode.window.showInformationMessage('Login successful!');
            } else {
              vscode.window.showErrorMessage('Login failed. Token not set.');
            }
          });
        }
      });
  } else {
    vscode.window.showInformationMessage('You are already logged in.');
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('syntax-snipp.logout', () => {
      TokenManager.removeToken();
      vscode.window.showInformationMessage('You have been logged out.');
    })
  );
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
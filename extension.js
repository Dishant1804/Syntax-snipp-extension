const vscode = require('vscode');

const { authenticate } = require('./src/helpers/authenticate.js');
const { TokenManager } = require('./src/helpers/TokenManager.js');
const { createSnippet } = require('./src/routes/createsnippet.js');
const { readSnippet } = require('./src/routes/readsnippet.js');
const { updateSnippet } = require('./src/routes/updatesnippet.js');

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
              vscode.window.showErrorMessage('Login failed. Try again.');
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

  context.subscriptions.push(
    vscode.commands.registerCommand('syntax-snipp.createSnippet', async () => {
      createSnippet();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('syntax-snipp.readSnippet', async () => {
      readSnippet();
    })  
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('syntax-snipp.updateSnippet' , async () => {
      updateSnippet();
    })
  )
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
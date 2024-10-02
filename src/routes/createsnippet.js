const axios = require('axios');
const vscode = require('vscode');

const { TokenManager } = require('../helpers/TokenManager.js');

const createSnippet = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor. PLease select an active editor');
        return;
    }

    const selection = editor.selection;
    const content = editor.document.getText(selection);

    if (!content) {
        vscode.window.showErrorMessage('No text selected');
        return;
    }

    const title = await vscode.window.showInputBox({ prompt: 'Enter snippet title' });
    if (!title) return;

    const description = await vscode.window.showInputBox({ prompt: 'Enter snippet description' });
    if (!description) return;

    const tagsInput = await vscode.window.showInputBox({ prompt: 'Enter tags (comma-separated)' });
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

    const language = editor.document.languageId;

    try {
        const token = TokenManager.getToken();

        if (!token) {
            vscode.window.showErrorMessage('You need to log in first');
            return;
        }

        const response = await axios.post('http://localhost:3000/api/v1/snippet/createsnippet', {
            title,
            content,
            description,
            tags,
            favorite: false,
            language
        }, {
            headers: {
                'Authorization': token
            }
        });

        if (response.data.success) {
            vscode.window.showInformationMessage('Snippet created successfully');
        }
        else {
            vscode.window.showErrorMessage('create snippet error in route')
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('Failed to create snippet');
    }
}

module.exports = { createSnippet }
const vscode = require('vscode');
const axios = require('axios');
const { TokenManager } = require('../helpers/TokenManager.js');

const readSnippet = async () => {
    const token = TokenManager.getToken();
    if (!token) {
        vscode.window.showErrorMessage('No token found. Please login first.');
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/api/v1/snippet/mysnippets', {
            headers: { 'Authorization': token }
        });

        const snippets = response.data.snippets;

        const selectedSnippet = await vscode.window.showQuickPick(
            snippets.map(snippet => ({
                label: snippet.title,
                description: snippet.description,
                detail: `Username : ${snippet.user.username}`,
                snippet: snippet.content
            })),
            { placeHolder: 'Select a snippet to insert' }
        );

        if (selectedSnippet) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, selectedSnippet.snippet);
                });
            } else {
                vscode.window.showErrorMessage('No active text editor found.');
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching snippets: ${error.message}`);
    }
};

module.exports = { readSnippet };
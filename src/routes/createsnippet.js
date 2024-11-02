const axios = require('axios');
const vscode = require('vscode');

const { TokenManager } = require('../helpers/TokenManager.js');

const languages = [
    'javascript', 'python', 'java', 'c', 'c++', 'jsx', 'tsx', 'html', 'css', 'typescript', 'sql', 'php', 'ruby', 'go', 'swift', 'kotlin', 'flutter', 'xml', 'json', 'markdown', 'shell', 'r', 'vue', 'yaml', 'csharp',
];

const languageMapping = {
    'jsx': 'javascript',
    'tsx': 'typescript'
};

const createSnippet = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor. Please select an active editor');
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

    let currentLanguage = editor.document.languageId;
    let language;

    if (languages.includes(currentLanguage)) {
        language = currentLanguage;
    } else {
        language = await vscode.window.showQuickPick(languages, {
            placeHolder: 'Select a language for the snippet'
        });
        if (!language) return;
    }

    //mapping jsx to js and tsx to ts
    if (languageMapping[language]) {
        language = languageMapping[language];
    }

    try {
        const token = TokenManager.getToken();
        const isSubscribed = TokenManager.getSubscribed();

        if (!token) {
            vscode.window.showErrorMessage('You need to log in first');
            return;
        }

        let isPrivate = false;

        if (isSubscribed) {
            const visibility = await vscode.window.showQuickPick(
                ['Public', 'Private'],
                {
                    placeHolder: 'Select snippet visibility',
                    title: 'Snippet Visibility'
                }
            );
            if (!visibility) return;
            isPrivate = visibility === 'Private';
        }

        const response = await axios.post('http://localhost:3000/api/v1/snippet/createsnippet', {
            title,
            content,
            description,
            tags,
            favorite: false,
            language,
            isPrivate
        }, {
            headers: {
                'Authorization': token
            }
        });

        if (response.data.success) {
            vscode.window.showInformationMessage(`${isPrivate ? 'Private' : 'Public'} snippet created successfully`);
        } else {
            vscode.window.showErrorMessage('Create snippet error in route');
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('Failed to create snippet');
    }
}

module.exports = { createSnippet }
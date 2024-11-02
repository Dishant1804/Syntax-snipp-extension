const vscode = require('vscode');
const { TokenManager } = require('../helpers/TokenManager');
const axios = require('axios');

const updateSnippet = async () => {
    const token = TokenManager.getToken();
    if (!token) {
        vscode.window.showErrorMessage('No token found. Please login first.');
        return;
    }

    try {
        console.log('Fetching snippets...');
        const response = await axios.get('http://localhost:3000/api/v1/snippet/mysnippets', {
            headers: { 'Authorization': token }
        });

        const snippets = response.data.snippets;
        console.log(`Fetched ${snippets.length} snippets`);

        if (!snippets || snippets.length === 0) {
            vscode.window.showInformationMessage('No snippets found.');
            return;
        }

        console.log('Showing snippet selection...');
        const selectedSnippet = await vscode.window.showQuickPick(
            snippets.map(snippet => ({
                label: snippet.title,
                description: `ID: ${snippet.id}`,
                detail: truncateString(snippet.content, 50),
                snippet: snippet
            })),
            { placeHolder: 'Select a snippet to update' }
        );

        if (!selectedSnippet) {
            console.log('No snippet selected');
            return;
        }

        const isSubscribed = TokenManager.getSubscribed();
        const updateFields = [
            { label: 'Title', value: 'title' },
            { label: 'Description', value: 'description' },
            { label: 'Content', value: 'content' },
            { label: 'Language', value: 'language' },
            { label: 'Favorite', value: 'favorite' },
            { label: 'Tags', value: 'tags' }
        ];

        if (isSubscribed) {
            updateFields.push({ label: 'Visibility', value: 'visibility' });
        }

        console.log('Showing fields to update...');
        const fieldsToUpdate = await vscode.window.showQuickPick(updateFields, {
            canPickMany: true,
            placeHolder: 'Select fields to update'
        });

        if (!fieldsToUpdate || fieldsToUpdate.length === 0) {
            console.log('No fields selected for update');
            return;
        }

        const updateData = {};
        let cancelled = false;  // Track if the user cancels any update

        for (const field of fieldsToUpdate) {
            console.log(`Updating field: ${field.value}`);
            try {
                switch (field.value) {
                    case 'title':
                    case 'description':
                    case 'language':
                        const value = await vscode.window.showInputBox({
                            prompt: `Enter new ${field.label}`,
                            placeHolder: field.label,
                            value: selectedSnippet.snippet[field.value]
                        });
                        if (value) updateData[field.value] = value;
                        break;
                    case 'content':
                        let selectedText = '';
                        while (!selectedText) {
                            const editor = vscode.window.activeTextEditor;
                            if (editor && editor.selection) {
                                selectedText = editor.document.getText(editor.selection);
                            }

                            if (!selectedText) {
                                const selectText = await vscode.window.showQuickPick(['Yes', 'Cancel'], {
                                    placeHolder: 'No text selected. Do you want to select text now? (select within 5 seconds)'
                                });

                                if (selectText === 'Cancel') {
                                    vscode.window.showInformationMessage('Content update cancelled. No changes made.');
                                    cancelled = true;
                                    break;
                                }
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            }
                        }

                        if (cancelled) break;

                        if (selectedText) {
                            const useSelectedText = await vscode.window.showQuickPick(['Yes', 'No'], {
                                placeHolder: 'Use selected text as new content?'
                            });
                            if (useSelectedText === 'Yes') {
                                updateData.content = selectedText;
                            } else {
                                vscode.window.showInformationMessage('Content update cancelled. No changes made.');
                                cancelled = true;
                            }
                        }
                        break;
                    case 'favorite':
                        const favoriteChoice = await vscode.window.showQuickPick(
                            ['true', 'false'],
                            {
                                placeHolder: 'Set as favorite?',
                                activeItems: [selectedSnippet.snippet.favorite ? 'true' : 'false']
                            }
                        );
                        if (favoriteChoice) updateData.favorite = favoriteChoice === 'true';
                        break;
                    case 'tags':
                        const currentTags = selectedSnippet.snippet.tags.map(t => t.tag.name).join(', ');
                        const tagsInput = await vscode.window.showInputBox({
                            prompt: 'Enter new tags (comma-separated)',
                            placeHolder: 'tag1, tag2, tag3',
                            value: currentTags
                        });
                        if (tagsInput) updateData.tags = tagsInput.split(',').map(tag => tag.trim());
                        break;
                    case 'visibility':
                        const visibilityChoice = await vscode.window.showQuickPick(
                            ['Public', 'Private'],
                            {
                                placeHolder: 'Select snippet visibility',
                                title: 'Snippet Visibility'
                            }
                        );
                        if (visibilityChoice) updateData.isPrivate = visibilityChoice === 'Private';
                        break;
                }
            } catch (fieldError) {
                console.error(`Error updating field ${field.value}:`, fieldError);
            }
        }

        if (cancelled) {
            vscode.window.showInformationMessage('All changes have been cancelled. You can try again.');
            return; // Exit if cancelled
        }

        if (Object.keys(updateData).length === 0) {
            vscode.window.showInformationMessage('No fields were updated.');
            return;
        }

        console.log('Sending update request...');
        const updateResponse = await axios.patch(
            `http://localhost:3000/api/v1/snippet/updatesnippet/${selectedSnippet.snippet.id}`,
            updateData,
            { headers: { 'Authorization': token } }
        );

        const visibilityStatus = updateData.hasOwnProperty('isPrivate')
            ? `(${updateData.isPrivate ? 'Private' : 'Public'}) `
            : '';
        vscode.window.showInformationMessage(`Snippet ${visibilityStatus}updated successfully: ${updateResponse.data.snippet.title}`);
    } catch (error) {
        console.error('Error in updateSnippet:', error);
        if (error.response) {
            vscode.window.showErrorMessage(`Error updating snippet: ${error.response.data.error}`);
        } else {
            vscode.window.showErrorMessage(`Error updating snippet: ${error.message}`);
        }
    }
};

function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

module.exports = { updateSnippet };
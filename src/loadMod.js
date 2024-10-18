const vscode = require('vscode');
const AdmZip = require('adm-zip');
const fs = require('fs');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.extractMod', async function () {
        const zipFileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Zip files': ['zip']
            }
        });

        if (!zipFileUri || zipFileUri.length === 0) {
            vscode.window.showErrorMessage('No zip file selected');
            return;
        }

        const extractDirUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFolders: true
        });

        if (!extractDirUri || extractDirUri.length === 0) {
            vscode.window.showErrorMessage('No extraction directory selected');
            return;
        }

        const zipFilePath = zipFileUri[0].fsPath;
        const extractTo = extractDirUri[0].fsPath;

        try {
            const zip = new AdmZip(zipFilePath);
            zip.extractAllTo(extractTo, true);
            vscode.window.showInformationMessage(`Mod extracted to ${extractTo}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to extract mod: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

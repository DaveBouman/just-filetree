import * as vscode from 'vscode';
import { JustTreeDataProvider } from './justTreeDataProvider';
import * as fs from 'fs';

function getGitBashPath(): string | null {
	const candidates = [
		`${process.env.ProgramFiles}\\Git\\bin\\bash.exe`,
		`${process.env.ProgramFiles}\\Git\\usr\\bin\\bash.exe`,
		`${process.env['ProgramFiles(x86)']}\\Git\\bin\\bash.exe`,
		`${process.env['ProgramFiles(x86)']}\\Git\\usr\\bin\\bash.exe`,
		`${process.env.LOCALAPPDATA}\\Programs\\Git\\bin\\bash.exe`,
		`${process.env.LOCALAPPDATA}\\Programs\\Git\\usr\\bin\\bash.exe`
	];

	for (const path of candidates) {
		if (path && fs.existsSync(path)) {
			return path;
		}
	}

	return null;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Just List extension is now active!');

	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!workspaceRoot) {
		vscode.window.showErrorMessage('No workspace folder found');
		return;
	}

	const justTreeDataProvider = new JustTreeDataProvider(workspaceRoot);
	const treeView = vscode.window.createTreeView('justCommands', {
		treeDataProvider: justTreeDataProvider
	});

	context.subscriptions.push(treeView);

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('just-list.refresh', () => {
		justTreeDataProvider.refresh();
	});
	context.subscriptions.push(refreshCommand);

	// Register run command
	const runCommand = vscode.commands.registerCommand('just-list.runCommand', (commandName: string, justfilePath?: string) => {
		const gitBashPath = getGitBashPath();
		
		const terminal = gitBashPath 
			? vscode.window.createTerminal({
				name: 'Just',
				shellPath: gitBashPath
			})
			: vscode.window.createTerminal('Just');
			
		terminal.show();
		
		if (justfilePath) {
			terminal.sendText(`just --justfile "${justfilePath}" ${commandName}`);
		} else {
			terminal.sendText(`just ${commandName}`);
		}
	});
	context.subscriptions.push(runCommand);
}

export function deactivate() {}

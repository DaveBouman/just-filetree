import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

type TreeItemType = JustFile | JustGroup | JustCommand;

export class JustFile extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = filePath;
        this.contextValue = 'justFile';
        this.description = path.basename(filePath);
    }
}

export class JustGroup extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly groupName: string,
        public readonly commands: JustCommand[]
    ) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'justGroup';
        this.description = `${commands.length} recipe${commands.length !== 1 ? 's' : ''}`;
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}

export class JustCommand extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly justfilePath: string,
        public readonly command?: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = description;
        this.contextValue = 'justCommand';
        this.iconPath = new vscode.ThemeIcon('play');
    }
}

export class JustTreeDataProvider implements vscode.TreeDataProvider<TreeItemType> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItemType | undefined | null | void> = new vscode.EventEmitter<TreeItemType | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItemType | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItemType): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItemType): Thenable<TreeItemType[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No justfile in empty workspace');
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show groups directly
            const groups = this.getGroupedCommands();
            if (groups.length === 0) {
                vscode.window.showInformationMessage('Workspace has no justfiles');
                return Promise.resolve([]);
            }
            return Promise.resolve(groups);
        } else if (element.contextValue === 'justGroup' && 'commands' in element) {
            // Show commands under a group
            const group = element as JustGroup;
            return Promise.resolve(group.commands);
        }
        
        return Promise.resolve([]);
    }

    private findMainJustfile(): string | null {
        const candidates = ['justfile', '.justfile', 'Justfile'];
        
        for (const candidate of candidates) {
            const fullPath = path.join(this.workspaceRoot, candidate);
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                return fullPath;
            }
        }
        
        return null;
    }

    private findAllJustfiles(): string[] {
        const justfiles: string[] = [];
        
        try {
            // Check for justfiles in the workspace root
            const rootFiles = fs.readdirSync(this.workspaceRoot);
            
            for (const file of rootFiles) {
                const fullPath = path.join(this.workspaceRoot, file);
                const stats = fs.statSync(fullPath);
                
                // Check root-level justfiles
                if (stats.isFile()) {
                    if (file === 'justfile' || file === '.justfile' || file === 'Justfile') {
                        justfiles.push(fullPath);
                    }
                }
            }
            
            // Check for justfiles in .just directory
            const justDir = path.join(this.workspaceRoot, '.just');
            if (fs.existsSync(justDir) && fs.statSync(justDir).isDirectory()) {
                const dirFiles = fs.readdirSync(justDir);
                
                for (const file of dirFiles) {
                    const fullPath = path.join(justDir, file);
                    
                    // Check if it's a file that ends with .justfile
                    if (fs.statSync(fullPath).isFile() && file.endsWith('.justfile')) {
                        justfiles.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error('Error reading workspace directory:', error);
        }
        
        return justfiles.sort();
    }

    private getGroupedCommands(): JustGroup[] {
        const allJustfiles = this.findAllJustfiles();
        const groupMap = new Map<string, JustCommand[]>();

        // Parse all justfiles and group their commands
        for (const justfilePath of allJustfiles) {
            const commandsWithGroups = this.getJustCommandsWithGroups(justfilePath);
            
            for (const { command, group } of commandsWithGroups) {
                const groupName = group || 'default';
                if (!groupMap.has(groupName)) {
                    groupMap.set(groupName, []);
                }
                groupMap.get(groupName)!.push(command);
            }
        }

        // Convert map to JustGroup array
        const groups: JustGroup[] = [];
        
        // Sort groups: default last, others alphabetically
        const sortedGroups = Array.from(groupMap.entries()).sort((a, b) => {
            if (a[0] === 'default') return 1;
            if (b[0] === 'default') return -1;
            return a[0].localeCompare(b[0]);
        });

        for (const [groupName, commands] of sortedGroups) {
            const displayName = groupName === 'default' ? 'all recipes' : groupName;
            groups.push(new JustGroup(displayName, groupName, commands));
        }

        return groups;
    }

    private getJustCommandsWithGroups(justfilePath: string): Array<{ command: JustCommand; group: string | null }> {
        const results: Array<{ command: JustCommand; group: string | null }> = [];
        
        if (!this.pathExists(justfilePath)) {
            return results;
        }

        try {
            // Read the justfile content to extract group attributes
            const content = fs.readFileSync(justfilePath, 'utf-8');
            const lines = content.split('\n');
            
            // Map recipe names to their groups
            const recipeGroups = new Map<string, string>();
            let pendingGroup: string | null = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                // Check for group attribute: [group('name')] or [group("name")]
                const groupMatch = /\[group\(['"]([^'"]+)['"]\)\]/.exec(trimmedLine);
                if (groupMatch) {
                    pendingGroup = groupMatch[1];
                    continue;
                }
                
                // Skip other attribute lines like [script], [private], etc.
                if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                    continue;
                }
                
                // Check for recipe definition (non-indented line with name, optional params, and colon)
                // Recipe lines start at column 0 (no leading spaces)
                if (!line.startsWith(' ') && !line.startsWith('\t')) {
                    const recipeMatch = /^([a-zA-Z0-9_-]+)(?:\s+[^:]*)?:/.exec(trimmedLine);
                    if (recipeMatch) {
                        const recipeName = recipeMatch[1];
                        if (pendingGroup) {
                            recipeGroups.set(recipeName, pendingGroup);
                            pendingGroup = null; // Reset after assigning
                        }
                    }
                }
            }
            
            // Now get the list of commands using just --list
            const { execSync } = require('child_process');
            const workspaceDir = path.dirname(justfilePath);
            
            const output = execSync(`just --justfile "${justfilePath}" --list --list-heading ""`, {
                cwd: workspaceDir,
                encoding: 'utf-8'
            });
            
            const outputLines = output.split('\n');
            
            for (const line of outputLines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                    continue;
                }
                
                // Parse the format: "    command-name [parameters] # description"
                const match = /^\s*([a-zA-Z0-9_-]+)(?:\s+[^#]+?)?\s*(?:#\s*(.*))?$/.exec(line);
                if (match) {
                    const commandName = match[1];
                    const description = match[2]?.trim() || 'Run just command';
                    
                    const command = new JustCommand(
                        commandName,
                        description,
                        justfilePath,
                        {
                            command: 'just-list.runCommand',
                            title: 'Run',
                            arguments: [commandName, justfilePath]
                        }
                    );
                    
                    const group = recipeGroups.get(commandName) || null;
                    results.push({ command, group });
                }
            }
            
        } catch (error) {
            console.error('Error parsing justfile:', error);
        }
        
        return results;
    }

    private getJustCommands(justfilePath: string): JustCommand[] {
        if (this.pathExists(justfilePath)) {
            try {
                const { execSync } = require('child_process');
                const workspaceDir = path.dirname(justfilePath);
                const justfileName = path.basename(justfilePath);
                
                // Use `just --list` with --justfile to specify which file
                const output = execSync(`just --justfile "${justfilePath}" --list --list-heading ""`, {
                    cwd: workspaceDir,
                    encoding: 'utf-8'
                });
                
                const commands: JustCommand[] = [];
                const lines = output.split('\n');
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) {
                        continue;
                    }
                    
                    // Parse the format: "    command-name [parameters] # description"
                    // This handles both simple commands and commands with parameters
                    const match = /^\s*([a-zA-Z0-9_-]+)(?:\s+[^#]+?)?\s*(?:#\s*(.*))?$/.exec(line);
                    if (match) {
                        const commandName = match[1];
                        const description = match[2]?.trim() || 'Run just command';
                        
                        commands.push(new JustCommand(
                            commandName,
                            description,
                            justfilePath,
                            {
                                command: 'just-list.runCommand',
                                title: 'Run',
                                arguments: [commandName, justfilePath]
                            }
                        ));
                    }
                }
                
                return commands;
            } catch (error) {
                console.error('Error running just --list:', error);
                vscode.window.showErrorMessage('Failed to list just commands. Make sure "just" is installed and in your PATH.');
                return [];
            }
        } else {
            return [];
        }
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }
}

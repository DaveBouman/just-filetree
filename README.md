# Just List

A VS Code extension that displays justfile commands organized by groups in the Activity Bar for quick access.

## Features

- **📁 Grouped Commands**: Automatically organizes recipes by their `[group('name')]` attributes
- **🔍 Multi-File Support**: Aggregates commands from main `.justfile` and all `.just/*.justfile` files
- **▶️ One-Click Execution**: Click any command to run it in Git Bash terminal
- **🔄 Auto-Discovery**: Automatically parses all justfiles in your workspace
- **💬 Command Descriptions**: Displays comments from your justfile as tooltips
- **🐚 Git Bash Integration**: Automatically uses Git Bash on Windows (not WSL)

## Usage

1. Open a workspace containing a `.justfile` or `.just/` directory
2. Click the Just icon in the Activity Bar (left sidebar)
3. Browse commands organized by groups (e.g., dab, git, vscode)
4. Click any command to execute it in Git Bash
5. Use the refresh button (🔄) to reload commands after editing justfiles

## File Structure

The extension supports the following structure:

```
workspace/
├── .justfile                 # Main justfile
└── .just/                    # Optional directory for organized justfiles
    ├── dab.justfile
    ├── git.justfile
    └── vscode.justfile
```

## Sample Justfile with Groups

```just
# Commands are organized by their group attribute

# Build the project
[group('dev')]
build:
    echo "Building project..."
    npm run compile

# Run tests
[group('dev')]
test:
    echo "Running tests..."
    npm test

# Deploy to production
[group('deploy')]
deploy target='prod':
    echo "Deploying to {{target}}..."
    ./deploy.sh {{target}}
```

In the Activity Bar, these appear as:
```
📁 dev (2 recipes)
  ▶️ build
  ▶️ test
📁 deploy (1 recipe)
  ▶️ deploy
```

## Requirements

- [just](https://github.com/casey/just) command runner (v1.25.0+) must be installed and available in your PATH
- Git Bash (on Windows) - automatically detected from standard Git for Windows installation

## Extension Commands

- `just-list.refresh`: Refresh the command list
- `just-list.runCommand`: Run a just command

## Release Notes

### 0.0.1

Initial release:
- Group-based command organization
- Multi-file justfile support
- Git Bash integration (Windows)
- Auto-discovery of recipes with parameters

---

**Enjoy!**

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

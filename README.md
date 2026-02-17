# Just List

A VS Code extension that displays justfile commands in the Activity Bar for quick access.

## Features

- **Activity Bar View**: Shows all just commands in a dedicated sidebar view
- **One-Click Execution**: Click any command to run it in the integrated terminal
- **Auto-Discovery**: Automatically parses your workspace's justfile
- **Command Descriptions**: Displays comments from your justfile as command descriptions

## Usage

1. Open a workspace containing a `justfile`
2. Click the Just icon in the Activity Bar (left sidebar)
3. Browse available commands in the "Commands" view
4. Click any command to execute it in the terminal
5. Use the refresh button to reload commands after editing your justfile

## Requirements

- [just](https://github.com/casey/just) command runner must be installed and available in your PATH

## Sample Justfile

```just
# Build the project
build:
    echo "Building project..."
    npm run compile

# Run tests
test:
    echo "Running tests..."
    npm test

# Clean build artifacts
clean:
    echo "Cleaning..."
    rm -rf dist out
```

## Extension Commands

- `just-list.refresh`: Refresh the command list
- `just-list.runCommand`: Run a just command

**Enjoy!**

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

# Welcome to Container Monitoring Extension

## About the Extension

This folder contains all the necessary files for your Container Monitoring Extension for Visual Studio Code.

- `package.json` - Manifest file declaring your extension and commands.
  - The extension registers commands and defines their titles and command names, visible in the command palette.
- `extension.js` - Main file where you implement extension functionality.
  - Exports an `activate` function called when the extension is first activated. It uses `registerCommand` to define command behavior.

## Get Started

To begin using the Container Monitoring Extension:

- Press `F5` to open a new VS Code window with the extension loaded.
- Access commands from the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) by typing commands related to container monitoring.

## Debugging

- Set breakpoints in `extension.js` to debug your extension.
- Use the debug toolbar to relaunch the extension after code changes.
- Reload VS Code (`Ctrl+R` or `Cmd+R` on Mac) to apply changes.

## API Reference

- Explore the full API in `node_modules/@types/vscode/index.d.ts`.

## Testing

- Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner).
- Open the Testing view from the activity bar and click "Run Test" (`Ctrl/Cmd + ; A`) to execute tests.
- View test results in the Test Results view (`Ctrl/Cmd + Shift + Y`).

## Further Steps

- Follow [UX guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) for seamless integration with VS Code's interface.
- Learn how to [publish your extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VS Code Marketplace.
- Implement [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration) for automated builds.

**Happy coding with your Container Monitoring Extension!**

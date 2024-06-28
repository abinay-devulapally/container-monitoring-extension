// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const DockerAlertHandler = require("./dockerAlertHandler");
const DockerEventHandler = require("./dockerEventHandler");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.startMonitoring",
    function () {
      const queue = [];

      const alertHandler = new DockerAlertHandler(queue);
      const eventHandler = new DockerEventHandler(queue);

      alertHandler.run();
      eventHandler.run();

      vscode.window.showInformationMessage("Container Monitoring Started!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

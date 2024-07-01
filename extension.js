// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const process_backend_server = require("./app");
const DockerAlertHandler = require("./dockerAlertHandler");
const DockerEventHandler = require("./dockerEventHandler");

process_backend_server();

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
  const openDashboard = vscode.commands.registerCommand(
    "extension.openDashboard",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "dashboard",
        "Container Monitoring Dashboard",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(context.extensionPath, "out", "client", "bundle.js")
        )
      );

      const styleUri = panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(context.extensionPath, "out", "client", "styles.css")
        )
      );

      const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Container Monitoring Dashboard</title>
                <link href="${styleUri}" rel="stylesheet">
                <style>
                    /* Additional styles for demo purposes */
                    .panel-content {
                        display: none;
                    }

                    .panel-content.active {
                        display: block;
                    }
                </style>
                <script type="module" src="${scriptUri}"></script>
            </head>

            <body class="bg-gray-100">
                <div id="root"></div>
                <script>
                    console.log('Loading bundle.js');
                </script>
            </body>

            </html>
    `;

      panel.webview.html = htmlContent;
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(openDashboard);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

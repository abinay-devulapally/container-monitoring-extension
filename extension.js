const vscode = require("vscode");
const path = require("path");
const { startServer, stopServer } = require("./app");
const DockerAlertHandler = require("./dockerAlertHandler");
const DockerEventHandler = require("./dockerEventHandler");

startServer();

let alertHandler = null;
let eventHandler = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let startMonitoring = vscode.commands.registerCommand(
    "extension.startMonitoring",
    function () {
      if (!alertHandler && !eventHandler) {
        const queue = [];

        alertHandler = new DockerAlertHandler(queue);
        eventHandler = new DockerEventHandler(queue);

        alertHandler.run();
        eventHandler.run();

        vscode.window.showInformationMessage("Container Monitoring Started!");
      } else {
        vscode.window.showInformationMessage(
          "Container Monitoring is already running."
        );
      }
    }
  );

  let stopMonitoring = vscode.commands.registerCommand(
    "extension.stopMonitoring",
    function () {
      if (alertHandler && eventHandler) {
        alertHandler.stop();
        eventHandler.stop();

        alertHandler = null;
        eventHandler = null;

        vscode.window.showInformationMessage("Container Monitoring Stopped!");
      } else {
        vscode.window.showInformationMessage(
          "Container Monitoring is not running."
        );
      }
    }
  );

  let openDashboard = vscode.commands.registerCommand(
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

  context.subscriptions.push(startMonitoring);
  context.subscriptions.push(stopMonitoring);
  context.subscriptions.push(openDashboard);
}

// This method is called when your extension is deactivated
function deactivate() {
  if (alertHandler && eventHandler) {
    alertHandler.stop();
    eventHandler.stop();

    alertHandler = null;
    eventHandler = null;
  }

  stopServer();
}

module.exports = {
  activate,
  deactivate,
};

const vscode = require("vscode");
const path = require("path");
const { startServer, stopServer } = require("./out/server/server.bundle");
const DockerAlertHandler = require("./healthmonitor/dockerAlertHandler");
const DockerEventHandler = require("./healthmonitor/dockerEventHandler");

startServer();

let alertHandler = null;
let eventHandler = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register command to set API Key
  let setApiKey = vscode.commands.registerCommand(
    "extension.setApiKey",
    async () => {
      const apiKeyType = await vscode.window.showQuickPick(
        ["ChatGPT API Key", "Gemini API Key"],
        { placeHolder: "Select the type of API key to enter" }
      );

      if (!apiKeyType) {
        vscode.window.showWarningMessage("API key input was cancelled.");
        return;
      }

      const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${apiKeyType}`,
        ignoreFocusOut: true,
        password: true,
      });

      console.log(apiKey);

      if (apiKey) {
        const keyName =
          apiKeyType === "ChatGPT API Key" ? "chatgptApiKey" : "geminiApiKey";
        await context.secrets.store(keyName, apiKey);
        vscode.window.showInformationMessage(
          `${apiKeyType} saved successfully!`
        );
      } else {
        vscode.window.showWarningMessage("API key input was cancelled.");
      }
    }
  );

  // Command to start monitoring
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

  // Command to stop monitoring
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

  // Command to open the dashboard
  let openDashboard = vscode.commands.registerCommand(
    "extension.openDashboard",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "dashboard",
        "Container Monitoring Dashboard",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const chatgptApiKey = await context.secrets.get("chatgptApiKey");
      const geminiApiKey = await context.secrets.get("geminiApiKey");

      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(context.extensionPath, "out", "client", "client_bundle.js")
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
                    .panel-content {
                        display: none;
                    }

                    .panel-content.active {
                        display: block;
                    }
                </style>
                <script type="module" src="${scriptUri}"></script>
                <script>
                  window.chatgptApiKey = "${chatgptApiKey}";
                  window.geminiApiKey = "${geminiApiKey}";
                </script>
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

  context.subscriptions.push(setApiKey);
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

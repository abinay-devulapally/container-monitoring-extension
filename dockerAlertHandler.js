const Docker = require("dockerode");
const vscode = require("vscode");
const axios = require("axios");

const docker = new Docker();

class DockerAlertHandler {
  constructor(queue, maxRetries = 3) {
    this.queue = queue;
    this.raisedAlerts = new Set();
    this.raisedAlarms = new Set();
    this.maxRetries = maxRetries;
    this.retryAttempts = {};
    this.notifications = new Map();
    this.hostAddress = "http://localhost:8000";
    this.running = false;
  }

  async checkHealthyContainers() {
    try {
      return await docker.listContainers({ filters: { health: ["healthy"] } });
    } catch (error) {
      console.error("Error checking healthy containers:", error);
      return [];
    }
  }

  async checkAllContainers() {
    try {
      return await docker.listContainers();
    } catch (error) {
      console.error("Error checking all containers:", error);
      return [];
    }
  }

  createAlert(
    severity = "Info",
    host = "Windows Server",
    service,
    details,
    isAlarm = false,
    status = "active"
  ) {
    return {
      severity,
      host,
      service,
      details,
      isAlarm,
      status,
    };
  }

  async sendRequest(endpoint, alert) {
    try {
      const response = await axios.post(
        `${this.hostAddress}/${endpoint}`,
        alert,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.info(
          `${
            endpoint.charAt(0).toUpperCase() + endpoint.slice(1)
          } request executed successfully`
        );
        return;
      } else {
        console.error(
          `Failed to ${endpoint} alert with status code ${response.status}`
        );
      }
    } catch (error) {
      if (error.response) {
        // Log the full response object to understand the server's error message
        console.error(
          `Error ${endpoint} alert: ${error.response.status} - ${JSON.stringify(
            error.response.data,
            null,
            2
          )}`
        );
      } else if (error.request) {
        // Log the request that was made and didn't receive a response
        console.error(
          `Error ${endpoint} alert: No response received - ${error.request}`
        );
      } else {
        // Log any other errors that occurred during setup
        console.error(`Error ${endpoint} alert: ${error.message}`);
      }
    }
  }

  showNotification(type, message) {
    try {
      switch (type) {
        case "info":
          const infoNotification =
            vscode.window.showInformationMessage(message);
          this.notifications.set(message, infoNotification);
          break;
        case "warn":
          const warnNotification = vscode.window.showWarningMessage(message);
          this.notifications.set(message, warnNotification);
          break;
        case "error":
          const errorNotification = vscode.window.showErrorMessage(message);
          this.notifications.set(message, errorNotification);
          break;
        default:
          const defaultNotification =
            vscode.window.showInformationMessage(message);
          this.notifications.set(message, defaultNotification);
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  async clearNotification(message) {
    if (this.notifications.has(message)) {
      const notification = this.notifications.get(message);
      if (notification) {
        notification.dispose(); // Dispose the notification to clear it
        this.notifications.delete(message); // Remove from tracking
      }
    }
  }

  async processEvent(event) {
    let unit = "";
    if (event.service[0] === "/") {
      unit = event.service.slice(1);
    }

    try {
      if (event.status) {
        const createdAlarm = this.createAlert(
          "Critical",
          "Windows Server",
          unit,
          `Container ${unit} HealthCheck failed after retries`,
          true,
          "active"
        );
        this.showNotification(
          "error",
          `Container ${unit} HealthCheck failed after retries`
        );
        await this.sendRequest("alerts", createdAlarm);
        this.raisedAlarms.add(event.service);
      }
      const createdAlert = this.createAlert(
        "Warning",
        "Windows Server",
        unit,
        `Container ${unit} HealthCheck failed`,
        false,
        "active"
      );
      this.showNotification("warn", `Container ${unit} HealthCheck failed`);
      await this.sendRequest("alerts", createdAlert);
      this.raisedAlerts.add(event.service);
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }

  async checkAndClearAlerts() {
    try {
      const healthyContainerNames = new Set(
        (await this.checkHealthyContainers()).map(
          (container) => container.Names[0]
        )
      );
      const allContainerNames = new Set(
        (await this.checkAllContainers()).map((container) => container.Names[0])
      );
      let service = "";

      for (let unit of this.raisedAlerts) {
        if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
          if (unit[0] === "/") {
            service = unit.slice(1);
          }
          const createdClearedAlert = this.createAlert(
            "Warning",
            "Windows Server",
            unit,
            `Container ${unit} HealthCheck failed`,
            false,
            "cleared"
          );
          await this.clearNotification(`${service} alert cleared`);
          await this.sendRequest("clear-alert", createdClearedAlert);
          this.showNotification("info", `${service} alert cleared`);
          this.raisedAlerts.delete(unit);
        }
      }

      for (let unit of this.raisedAlarms) {
        if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
          if (unit[0] === "/") {
            service = unit.slice(1);
          }
          const createdClearedAlarm = this.createAlert(
            "Critical",
            "Windows Server",
            unit,
            `Container ${unit} HealthCheck failed after retries`,
            true,
            "cleared"
          );
          await this.clearNotification(`${service} alarm cleared and healthy`);
          await this.sendRequest("clear-alert", createdClearedAlarm);
          this.showNotification("info", `${service} alarm cleared and healthy`);
          this.raisedAlarms.delete(unit);
        }
      }
    } catch (error) {
      console.error("Error checking and clearing alerts:", error);
    }
  }

  async run() {
    this.running = true;
    while (this.running) {
      try {
        if (this.queue.length > 0) {
          const event = this.queue.shift();
          console.info(`Processing event: ${JSON.stringify(event)}`);
          await this.processEvent(event);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (this.raisedAlerts.size > 0 || this.raisedAlarms.size > 0) {
          await this.checkAndClearAlerts();
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
      } catch (error) {
        console.error(`Unexpected error: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  stop() {
    console.log("dockerAlertHandler Process Stopped");
    this.running = false;
  }
}

module.exports = DockerAlertHandler;

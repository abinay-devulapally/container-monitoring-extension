const Docker = require("dockerode");
const vscode = require("vscode");

const docker = new Docker();

class DockerAlertHandler {
  constructor(queue, maxRetries = 3) {
    this.queue = queue;
    this.raisedAlerts = new Set();
    this.raisedAlarms = new Set();
    this.maxRetries = maxRetries;
    this.retryAttempts = {};
    this.notifications = new Map();
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

  createAlert(host, service, isAlarm, status) {
    return {
      host: host,
      service: service,
      is_alarm: isAlarm,
      status: status,
    };
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
        this.showNotification(
          "error",
          `Container ${unit} HealthCheck failed after retries`
        );
        this.raisedAlarms.add(event.service);
      }
      this.showNotification("warn", `Container ${unit} HealthCheck failed`);
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
          await this.clearNotification(`${service} alert cleared`);
          this.showNotification("info", `${service} alert cleared`);
          this.raisedAlerts.delete(unit);
        }
      }

      for (let unit of this.raisedAlarms) {
        if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
          if (unit[0] === "/") {
            service = unit.slice(1);
          }
          await this.clearNotification(`${service} alarm cleared and healthy`);
          this.showNotification("info", `${service} alarm cleared and healthy`);
          this.raisedAlarms.delete(unit);
        }
      }
    } catch (error) {
      console.error("Error checking and clearing alerts:", error);
    }
  }

  async run() {
    while (true) {
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
}

module.exports = DockerAlertHandler;

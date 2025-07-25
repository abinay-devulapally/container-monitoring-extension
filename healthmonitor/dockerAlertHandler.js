const vscode = require("vscode");
const os = require("os");

const {
  checkHealthyContainers,
  checkAllContainers,
} = require("./containerStatus");

class DockerAlertHandler {
  constructor(queue, maxRetries = 3) {
    this.queue = queue;
    this.raisedAlerts = new Set();
    this.raisedAlarms = new Set();
    this.maxRetries = maxRetries;
    this.retryAttempts = {};
    this.notifications = new Map();
    this.hostname = os.hostname();
    this.hostAddress = "http://localhost:8000";
    this.running = false;
  }

  createAlert(
    severity = "Warning",
    host = this.hostname,
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
      const response = await fetch(`${this.hostAddress}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alert),
      });

      if (response.ok) {
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
      console.error(`Error ${endpoint} alert: ${error.message}`);
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
    try {
      let unit = event.service[0] === "/" ? event.service.slice(1) : "";
      const Alarmdetails = `Container ${unit} HealthCheck failed after retries`;
      if (event.status && !this.raisedAlarms.has(event.service)) {
        const createdAlarm = this.createAlert(
          "Critical",
          undefined,
          unit,
          Alarmdetails,
          true
        );
        this.showNotification("error", Alarmdetails);
        await this.sendRequest("api/v1/alerts", createdAlarm);
        this.raisedAlarms.add(event.service);
      }
      if (!this.raisedAlerts.has(event.service)) {
        const alertDetails = `Container ${unit} HealthCheck failed`;
        const createdAlert = this.createAlert(
          undefined,
          undefined,
          unit,
          alertDetails
        );
        this.showNotification("warn", alertDetails);
        await this.sendRequest("api/v1/alerts", createdAlert);
        this.raisedAlerts.add(event.service);
      }
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }

  async checkAndClearAlerts() {
    try {
      const healthyContainerNames = new Set(
        (await checkHealthyContainers()).map((container) => container.Names[0])
      );
      const allContainerNames = new Set(
        (await checkAllContainers()).map((container) => container.Names[0])
      );
      let service = "";

      for (let raisedAlert of this.raisedAlerts) {
        if (
          healthyContainerNames.has(raisedAlert) ||
          !allContainerNames.has(raisedAlert)
        ) {
          service = raisedAlert.startsWith("/") ? raisedAlert.slice(1) : "";

          const createdClearedAlert = this.createAlert(
            undefined,
            undefined,
            service,
            `Container ${service} HealthCheck failed`,
            false,
            "cleared"
          );
          await this.clearNotification(`${service} alert cleared`);
          await this.sendRequest("api/v1/clear-alert", createdClearedAlert);
          this.showNotification("info", `${service} alert cleared`);
          this.raisedAlerts.delete(raisedAlert);
        }
      }

      for (let raisedAlarm of this.raisedAlarms) {
        if (
          healthyContainerNames.has(raisedAlarm) ||
          !allContainerNames.has(raisedAlarm)
        ) {
          service = raisedAlarm.startsWith("/") ? raisedAlarm.slice(1) : "";
          const createdClearedAlarm = this.createAlert(
            "Critical",
            undefined,
            service,
            `Container ${service} HealthCheck failed after retries`,
            true,
            "cleared"
          );
          await this.clearNotification(`${service} alarm cleared and healthy`);
          await this.sendRequest("api/v1/clear-alert", createdClearedAlarm);
          this.showNotification("info", `${service} alarm cleared and healthy`);
          this.raisedAlarms.delete(raisedAlarm);
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

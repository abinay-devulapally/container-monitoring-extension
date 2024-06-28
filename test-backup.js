const Docker = require("dockerode");
const vscode = require("vscode");

const docker = new Docker();

class DockerAlertHandler {
  constructor(queue, maxRetries = 3) {
    this.queue = queue;
    this.raisedAlerts = new Set();
    this.raisedAlarms = new Set();
    this.maxRetries = maxRetries;
    this.retryAttempts = {}; // Dictionary to track retry attempts
  }

  async checkHealthyContainers() {
    return await docker.listContainers({ filters: { health: ["healthy"] } });
  }

  async checkAllContainers() {
    return await docker.listContainers();
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
    switch (type) {
      case "info":
        vscode.window.showInformationMessage(message);
        break;
      case "warn":
        vscode.window.showWarningMessage(message);
        break;
      case "error":
        vscode.window.showErrorMessage(message);
        break;
      default:
        vscode.window.showInformationMessage(message);
    }
  }

  async processEvent(event) {
    let unit = "";
    if (event.service[0] === "/") {
      unit = event.service.slice(1);
    }
    // const alert = this.createAlert("server2", service, event.status, "active");
    if (event.status) {
      this.showNotification(
        "error",
        `Container ${unit} HealthCheck failed after retries`
      );
      this.raisedAlarms.add(event.service);
    }
    this.showNotification("warn", `Container ${unit} HealthCheck failed`);
    this.raisedAlerts.add(event.service);
  }

  async checkAndClearAlerts() {
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
        // const clearAlert = this.createAlert("server2", unit, false, "cleared");
        if (unit[0] === "/") {
          service = unit.slice(1);
        }
        this.showNotification("info", `${service} alert cleared`);
        this.raisedAlerts.delete(unit);
      }
    }

    for (let unit of this.raisedAlarms) {
      if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
        // const clearAlert = this.createAlert("server2", unit, true, "cleared");
        if (unit[0] === "/") {
          service = unit.slice(1);
        }
        this.showNotification("info", `${service} alarm cleared and healthy`);
        this.raisedAlarms.delete(unit);
      }
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

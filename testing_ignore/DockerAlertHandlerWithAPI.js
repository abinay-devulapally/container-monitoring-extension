const Docker = require("dockerode");
const axios = require("axios");

const docker = new Docker();

class DockerAlertHandlerWithAPI {
  constructor(queue, hostAddress = "http://localhost:8080", maxRetries = 3) {
    this.queue = queue;
    this.hostAddress = hostAddress;
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

  createAlert(severity, host, details, isAlarm, status) {
    return {
      severity: severity,
      host: host,
      details: details,
      is_alarm: isAlarm,
      status: status,
    };
  }

  async sendRequest(endpoint, alert, unit) {
    if (
      this.retryAttempts[unit] &&
      this.retryAttempts[unit] >= this.maxRetries
    ) {
      console.warn(
        `Skipping ${
          endpoint.charAt(0).toUpperCase() + endpoint.slice(1)
        } for ${unit}. Reached maximum retries.`
      );
      return;
    }

    let retryCount = this.retryAttempts[unit] || 0;
    let backoffTime = 10; // initial backoff time in seconds

    while (retryCount < this.maxRetries) {
      try {
        console.info(
          `Sending ${
            endpoint.charAt(0).toUpperCase() + endpoint.slice(1)
          } Alert: ${JSON.stringify(alert)}`
        );

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
          if (endpoint === "alerts") {
            (alert.is_alarm ? this.raisedAlarms : this.raisedAlerts).add(unit);
          } else if (endpoint === "clear-alert") {
            (alert.is_alarm ? this.raisedAlarms : this.raisedAlerts).delete(
              unit
            );
          }
          console.info(
            `${
              endpoint.charAt(0).toUpperCase() + endpoint.slice(1)
            } request executed successfully`
          );
          delete this.retryAttempts[unit];
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
            `Error ${endpoint} alert: ${
              error.response.status
            } - ${JSON.stringify(error.response.data, null, 2)}`
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

      retryCount++;
      this.retryAttempts[unit] = retryCount;
      await new Promise((resolve) => setTimeout(resolve, backoffTime * 1000));
      backoffTime *= 2; // Double the backoff time for the next retry
    }

    console.error(
      `Exceeded maximum retries for ${endpoint} service: ${unit} and is_alarm: ${alert.isAlarm}`
    );
  }

  async processEvent(event) {
    const service = event.service;
    const alert = this.createAlert(
      "medium",
      "server2",
      `The ${service} container healthcheck failed`,
      event.status,
      "active"
    );
    await this.sendRequest("alerts", alert, service);
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

    for (let unit of this.raisedAlerts) {
      if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
        const clearAlert = this.createAlert(
          "medium",
          "server2",
          `The ${unit} container healthcheck failed`,
          false,
          "cleared"
        );
        await this.sendRequest("clear-alert", clearAlert, unit);
      }
    }

    for (let unit of this.raisedAlarms) {
      if (healthyContainerNames.has(unit) || !allContainerNames.has(unit)) {
        const clearAlert = this.createAlert(
          "medium",
          "server2",
          `The ${unit} container healthcheck failed`,
          true,
          "cleared"
        );
        await this.sendRequest("clear-alert", clearAlert, unit);
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

module.exports = DockerAlertHandlerWithAPI;

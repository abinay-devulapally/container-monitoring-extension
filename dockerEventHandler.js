const Docker = require("dockerode");
const async = require("async");

const docker = new Docker();

class DockerEventHandler {
  constructor(queue) {
    this.queue = queue;
    this.maxRetries = 2;
    this.processedContainers = new Set();
  }

  async checkUnhealthyContainers() {
    try {
      return await docker.listContainers({
        filters: { health: ["unhealthy"] },
      });
    } catch (error) {
      console.error("Error checking unhealthy containers:", error);
      return [];
    }
  }

  async checkHealthyContainers() {
    try {
      return await docker.listContainers({ filters: { health: ["healthy"] } });
    } catch (error) {
      console.error("Error checking healthy containers:", error);
      return [];
    }
  }

  async processContainer(container, maxRetries) {
    let retries = 1;
    while (retries < maxRetries) {
      try {
        const healthyContainers = await this.checkHealthyContainers();
        if (healthyContainers.some((c) => c.Id === container.Id)) {
          break;
        }
        if (!this.processedContainers.has(container.Id)) {
          console.log("PUSHING TO QUEUE ALERT", container.Names[0]);
          this.queue.push({ service: container.Names[0], status: false });
          await new Promise((resolve) => setTimeout(resolve, 40000));
        } else {
          break;
        }
        retries++;
      } catch (error) {
        console.error("Error processing container:", error);
        break;
      }
    }

    if (retries === maxRetries) {
      console.log("PUSHING TO QUEUE ALARM", container.Names[0]);
      this.queue.push({ service: container.Names[0], status: true });
      this.processedContainers.add(container.Id);
    }
  }

  async processUnhealthyContainers() {
    try {
      const unhealthyContainers = await this.checkUnhealthyContainers();

      async.eachLimit(unhealthyContainers, 5, async (container) => {
        await this.processContainer(container, this.maxRetries);
      });
    } catch (error) {
      console.error("Error processing unhealthy containers:", error);
    }
  }

  async run() {
    while (true) {
      try {
        const unhealthyContainers = await this.checkUnhealthyContainers();
        const healthyContainers = await this.checkHealthyContainers();

        console.log("dockerEventHandler process started");
        healthyContainers.forEach((container) =>
          this.processedContainers.delete(container.Id)
        );

        if (unhealthyContainers.length > 0) {
          await this.processUnhealthyContainers();
        }

        await new Promise((resolve) => setTimeout(resolve, 30000));
      } catch (error) {
        console.error("Error in main process loop:", error);
      }
    }
  }
}

module.exports = DockerEventHandler;

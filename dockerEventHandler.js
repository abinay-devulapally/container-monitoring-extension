const Docker = require("dockerode");
const async = require("async");

const docker = new Docker();

class DockerEventHandler {
  constructor(queue) {
    this.queue = queue;
    this.maxRetries = 2;
    this.processedContainers = new Set();
    this.running = false;
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

  async processContainer(container) {
    // console.log("#Processing container:", container.Names[0]);
    if (this.processedContainers.has(container.Id)) {
      return;
    }

    let retries = 1;
    while (retries < this.maxRetries) {
      try {
        const healthyContainers = await this.checkHealthyContainers();
        if (healthyContainers.some((c) => c.Id === container.Id)) {
          // Container is now healthy
          return;
        }

        // console.log("PUSHING TO QUEUE ALERT", container.Names[0]);
        this.queue.push({ service: container.Names[0], status: false });
        await new Promise((resolve) => setTimeout(resolve, 40000));
        retries++;
      } catch (error) {
        console.error("Error processing container:", error);
        return;
      }
    }

    // console.log("PUSHING TO QUEUE ALARM", container.Names[0]);
    this.queue.push({ service: container.Names[0], status: true });
    this.processedContainers.add(container.Id); // Mark container as processed
  }

  async processUnhealthyContainers() {
    try {
      const unhealthyContainers = await this.checkUnhealthyContainers();

      // Process each unhealthy container up to the limit of 5 concurrently
      async.eachLimit(unhealthyContainers, 5, async (container) => {
        await this.processContainer(container);
      });
    } catch (error) {
      console.error("Error checking unhealthy containers:", error);
    }
  }

  async run() {
    this.running = true;
    while (this.running) {
      try {
        const healthyContainers = await this.checkHealthyContainers();
        const unhealthyContainers = await this.checkUnhealthyContainers();

        console.log("dockerEventHandler process started");
        healthyContainers.forEach((container) =>
          this.processedContainers.delete(container.Id)
        );

        const containersToProcess = unhealthyContainers.filter(
          (container) => !this.processedContainers.has(container)
        );
        if (containersToProcess.length > 0) {
          await this.processUnhealthyContainers(containersToProcess);
        }

        await new Promise((resolve) => setTimeout(resolve, 30000));
      } catch (error) {
        console.error("Error in main process loop:", error);
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
  }

  stop() {
    console.log("dockerEventHandler Process Stopped");
    this.running = false;
  }
}

module.exports = DockerEventHandler;

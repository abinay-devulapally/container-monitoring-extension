const Docker = require("dockerode");

const docker = new Docker();

module.exports = {
  async checkHealthyContainers() {
    try {
      return await docker.listContainers({ filters: { health: ["healthy"] } });
    } catch (error) {
      console.error("Error checking healthy containers:", error);
      return [];
    }
  },

  async checkAllContainers() {
    try {
      return await docker.listContainers();
    } catch (error) {
      console.error("Error checking all containers:", error);
      return [];
    }
  },

  async checkUnhealthyContainers() {
    try {
      return await docker.listContainers({
        filters: { health: ["unhealthy"] },
      });
    } catch (error) {
      console.error("Error checking unhealthy containers:", error);
      return [];
    }
  },
};

const Docker = require("dockerode");

const docker = new Docker();

async function getContainerDetails(containerId) {
  const container = docker.getContainer(containerId);
  const details = await container.inspect();
  const stats = await container.stats({ stream: false });
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail: 100,
  });

  return {
    Id: details.Id,
    Name: details.Name, // Remove leading slash
    Image: details.Config.Image,
    State: details.State.Status,
    Status: details.State.Health
      ? details.State.Health.Status
      : details.State.Status,
    Created: details.Created,
    Ports: details.NetworkSettings.Ports,
    Labels: details.Config.Labels,
    NetworkMode: details.HostConfig.NetworkMode,
    IPAddress:
      details.NetworkSettings.Networks[
        Object.keys(details.NetworkSettings.Networks)[0]
      ].IPAddress,
    Mounts: details.Mounts.map((mount) => ({
      Source: mount.Source,
      Destination: mount.Destination,
      Mode: mount.RW ? "rw" : "ro",
    })),
    CPUUsage:
      (
        (stats.cpu_stats.cpu_usage.total_usage /
          stats.cpu_stats.system_cpu_usage) *
        100
      ).toFixed(2) + "%",
    MemoryUsage: (stats.memory_stats.usage / (1024 * 1024)).toFixed(2) + " MB",
    RestartCount: details.RestartCount,
    Logs: logs.toString(),
    HealthCheck: details.State.Health ? details.State.Health.Status : "N/A",
  };
}

module.exports = {
  async checkHealthyContainers() {
    try {
      return await docker.listContainers({ filters: { health: ["healthy"] } });
    } catch (error) {
      console.error("Error checking healthy containers:", error);
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

  async checkAllContainers() {
    try {
      const containers = await docker.listContainers({ all: true });
      const containerDetailsPromises = containers.map((container) =>
        getContainerDetails(container.Id)
      );
      return await Promise.all(containerDetailsPromises);
    } catch (error) {
      console.error("Error checking all containers:", error);
      return [];
    }
  },
};

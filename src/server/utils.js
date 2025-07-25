const Docker = require("dockerode");
const fs = require("fs");
const path = require("path");
const os = require("os");

class UniversalContainerMonitor {
  constructor() {
    this.docker = null;
    this.initializeConnection();
  }

  /**
   * Initialize Docker connection with multiple fallback strategies
   */
  initializeConnection() {
    const connectionStrategies = this.getConnectionStrategies();

    for (const strategy of connectionStrategies) {
      try {
        this.docker = new Docker(strategy.config);
        console.log(`Connected using strategy: ${strategy.name}`);
        return;
      } catch (error) {
        console.warn(`Failed to connect with ${strategy.name}:`, error.message);
        continue;
      }
    }

    throw new Error("Failed to connect to any container runtime");
  }

  /**
   * Check if a Windows named pipe exists
   */
  windowsPipeExists(pipeName) {
    // Try opening the pipe to check existence
    try {
      // This will throw if the pipe doesn't exist
      fs.openSync(pipeName, "r+");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all possible connection strategies for different platforms and runtimes
   */
  getConnectionStrategies() {
    const strategies = [];
    const platform = process.platform;

    // Strategy 1: Default Docker socket paths
    if (platform === "win32") {
      const pipePath = "//./pipe/docker_engine";
      if (this.windowsPipeExists(pipePath)) {
        strategies.push({
          name: "Windows Named Pipe",
          config: { socketPath: pipePath },
        });
      }
    } else {
      strategies.push({
        name: "Unix Socket",
        config: { socketPath: "/var/run/docker.sock" },
      });
    }

    // Strategy 2: Environment-based connection
    if (process.env.DOCKER_HOST) {
      const dockerHost = process.env.DOCKER_HOST;
      if (dockerHost.startsWith("tcp://")) {
        const url = new URL(dockerHost);
        strategies.push({
          name: "Environment TCP",
          config: {
            host: url.hostname,
            port: parseInt(url.port) || 2376,
            protocol: "http",
          },
        });
      } else if (dockerHost.startsWith("unix://")) {
        strategies.push({
          name: "Environment Unix Socket",
          config: { socketPath: dockerHost.replace("unix://", "") },
        });
      }
    }

    // Strategy 3: Rancher Desktop specific paths
    const rancherPaths = this.getRancherDesktopPaths();
    rancherPaths.forEach((socketPath) => {
      if (this.socketExists(socketPath)) {
        strategies.push({
          name: `Rancher Desktop - ${socketPath}`,
          config: { socketPath },
        });
      }
    });

    // Strategy 4: Docker Desktop alternative paths
    const dockerPaths = this.getDockerDesktopPaths();
    dockerPaths.forEach((socketPath) => {
      if (this.socketExists(socketPath)) {
        strategies.push({
          name: `Docker Desktop - ${socketPath}`,
          config: { socketPath },
        });
      }
    });

    // Strategy 5: TCP connections (for remote or exposed APIs)
    const tcpConfigs = [
      { host: "localhost", port: 2375, protocol: "http" },
      { host: "127.0.0.1", port: 2375, protocol: "http" },
      { host: "localhost", port: 2376, protocol: "https" },
      { host: "127.0.0.1", port: 2376, protocol: "https" },
    ];

    tcpConfigs.forEach((config, index) => {
      strategies.push({
        name: `TCP Connection ${index + 1}`,
        config,
      });
    });

    return strategies;
  }

  /**
   * Get potential Rancher Desktop socket paths
   */
  getRancherDesktopPaths() {
    const platform = process.platform;
    const homeDir = os.homedir();

    switch (platform) {
      case "darwin": // macOS
        return [
          path.join(homeDir, ".rd/docker.sock"),
          path.join(homeDir, ".rancher-desktop/docker.sock"),
          "/var/run/docker.sock",
        ];
      case "linux":
        return [
          path.join(homeDir, ".rd/docker.sock"),
          path.join(homeDir, ".rancher-desktop/docker.sock"),
          "/var/run/docker.sock",
          "/run/user/" + process.getuid() + "/docker.sock",
        ];
      case "win32":
        return [
          "//./pipe/docker_engine",
          "//./pipe/rancher_desktop_docker_engine",
        ];
      default:
        return [];
    }
  }

  /**
   * Get potential Docker Desktop socket paths
   */
  getDockerDesktopPaths() {
    const platform = process.platform;
    const homeDir = os.homedir();

    switch (platform) {
      case "darwin":
        return [
          "/var/run/docker.sock",
          path.join(homeDir, ".docker/desktop/docker.sock"),
          path.join(homeDir, ".docker/run/docker.sock"),
        ];
      case "linux":
        return [
          "/var/run/docker.sock",
          path.join(homeDir, ".docker/desktop/docker.sock"),
          "/run/user/" + process.getuid() + "/docker.sock",
        ];
      case "win32":
        return ["//./pipe/docker_engine"];
      default:
        return [];
    }
  }

  /**
   * Check if socket file exists (for Unix sockets)
   */
  socketExists(socketPath) {
    if (process.platform === "win32" && socketPath.startsWith("//./pipe/")) {
      return true; // Can't easily check named pipe existence
    }

    try {
      return fs.existsSync(socketPath);
    } catch {
      return false;
    }
  }

  /**
   * Test the connection and get Docker info
   */
  async testConnection() {
    try {
      const info = await this.docker.info();
      console.log("Connection successful!");
      console.log(`Server Version: ${info.ServerVersion}`);
      console.log(`Container Runtime: ${info.DefaultRuntime || "docker"}`);
      return true;
    } catch (error) {
      console.error("Connection test failed:", error.message);
      return false;
    }
  }

  /**
   * Enhanced container details retrieval with error handling
   */
  async getContainerDetails(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const details = await container.inspect();

      let stats = null;
      try {
        stats = await container.stats({ stream: false });
      } catch (statsError) {
        console.warn(
          `Failed to get stats for container ${containerId}:`,
          statsError.message
        );
      }

      const networkKeys = Object.keys(details.NetworkSettings.Networks || {});
      const firstNetwork = networkKeys[0];
      const ipAddress = firstNetwork
        ? details.NetworkSettings.Networks[firstNetwork].IPAddress || "N/A"
        : "N/A";

      const result = {
        Id: details.Id,
        Name: details.Name,
        Image: details.Config.Image,
        State: details.State.Status,
        Status: details.State.Health
          ? details.State.Health.Status
          : details.State.Status,
        Created: details.Created,
        Ports: details.NetworkSettings.Ports || {},
        Labels: details.Config.Labels || {},
        NetworkMode: details.HostConfig.NetworkMode,
        IPAddress: ipAddress,
        Mounts: (details.Mounts || []).map((mount) => ({
          Source: mount.Source,
          Destination: mount.Destination,
          Mode: mount.RW ? "rw" : "ro",
        })),
        RestartCount: details.RestartCount || 0,
        HealthCheck: details.State.Health ? details.State.Health.Status : "N/A",
      };

      // Add stats if available
      if (stats && stats.cpu_stats && stats.memory_stats) {
        try {
          const cpuDelta =
            stats.cpu_stats.cpu_usage.total_usage -
            (stats.precpu_stats?.cpu_usage?.total_usage || 0);
          const systemDelta =
            stats.cpu_stats.system_cpu_usage -
            (stats.precpu_stats?.system_cpu_usage || 0);
          const cpuPercent =
            systemDelta > 0 ? (cpuDelta / systemDelta) * 100.0 : 0;

          result.CPUUsage = cpuPercent.toFixed(2) + "%";
          result.MemoryUsage =
            (stats.memory_stats.usage / (1024 * 1024)).toFixed(2) + " MB";
        } catch (statError) {
          result.CPUUsage = "N/A";
          result.MemoryUsage = "N/A";
        }
      } else {
        result.CPUUsage = "N/A";
        result.MemoryUsage = "N/A";
      }

      return result;
    } catch (error) {
      console.error(
        `Error getting container details for ${containerId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Check all containers with enhanced error handling
   */
  async checkAllContainers() {
    try {
      if (!this.docker) {
        throw new Error("No Docker connection available");
      }

      const containers = await this.docker.listContainers({ all: true });
      console.log(`Found ${containers.length} containers`);

      const containerDetailsPromises = containers.map(async (container) => {
        try {
          return await this.getContainerDetails(container.Id);
        } catch (error) {
          console.error(
            `Failed to get details for container ${container.Id}:`,
            error.message
          );
          return {
            Id: container.Id,
            Name: container.Names?.[0] || "Unknown",
            Image: container.Image || "Unknown",
            State: container.State || "Unknown",
            Status: "Error retrieving details",
            Error: error.message,
          };
        }
      });

      return await Promise.all(containerDetailsPromises);
    } catch (error) {
      console.error("Error checking all containers:", error);
      return [];
    }
  }

  /**
   * Start container with error handling
   */
  async startContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      console.log(`Container ${containerId} started successfully`);
    } catch (error) {
      console.error("Error starting container:", error);
      throw error;
    }
  }

  /**
   * Stop container with error handling
   */
  async stopContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      console.log(`Container ${containerId} stopped successfully`);
    } catch (error) {
      console.error("Error stopping container:", error);
      throw error;
    }
  }

  /**
   * Restart container with error handling
   */
  async restartContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
      console.log(`Container ${containerId} restarted successfully`);
    } catch (error) {
      console.error("Error restarting container:", error);
      throw error;
    }
  }

  /**
   * Get runtime information
   */
  async getRuntimeInfo() {
    try {
      const info = await this.docker.info();
      return {
        serverVersion: info.ServerVersion,
        runtime: info.DefaultRuntime || "docker",
        platform: process.platform,
        architecture: info.Architecture,
        osType: info.OSType,
        totalMemory: info.MemTotal,
        containers: info.Containers,
        containersRunning: info.ContainersRunning,
        containersPaused: info.ContainersPaused,
        containersStopped: info.ContainersStopped,
        images: info.Images,
      };
    } catch (error) {
      console.error("Error getting runtime info:", error);
      return null;
    }
  }
}

// Create and export singleton instance
const monitor = new UniversalContainerMonitor();

module.exports = {
  // Test connection on module load
  async initialize() {
    return await monitor.testConnection();
  },

  // Get runtime information
  async getRuntimeInfo() {
    return await monitor.getRuntimeInfo();
  },

  // Main container operations
  async checkAllContainers() {
    return await monitor.checkAllContainers();
  },

  async startContainer(containerId) {
    return await monitor.startContainer(containerId);
  },

  async stopContainer(containerId) {
    return await monitor.stopContainer(containerId);
  },

  async restartContainer(containerId) {
    return await monitor.restartContainer(containerId);
  },

  // Direct access to monitor instance for advanced usage
  getMonitor() {
    return monitor;
  },
};

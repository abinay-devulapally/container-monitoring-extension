const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

// Configure AWS SDK
AWS.config.update({ region: "us-east-1" }); // Default region

// Endpoint to fetch AWS ECS container data
router.get("/containers", async (req, res, next) => {
  const { awsRegion, clusterName } = req.query;

  if (!awsRegion || !clusterName) {
    return res
      .status(400)
      .json({ error: "AWS region and cluster name are required" });
  }

  // Update AWS region based on the request
  AWS.config.update({ region: awsRegion });
  const ecs = new AWS.ECS();

  try {
    // Describe ECS clusters
    const { clusters } = await ecs
      .describeClusters({ clusters: [clusterName] })
      .promise();

    if (clusters.length === 0) {
      return res.status(404).json({ error: "Cluster not found" });
    }

    // Describe services in the cluster
    const services = await ecs.listServices({ cluster: clusterName }).promise();

    if (services.serviceArns.length === 0) {
      return res
        .status(404)
        .json({ error: "No services found in the cluster" });
    }

    // Describe tasks in the services
    const tasks = await ecs.listTasks({ cluster: clusterName }).promise();
    console.log("tasks", tasks);
    const taskDescriptions = await ecs
      .describeTasks({ cluster: clusterName, tasks: tasks.taskArns })
      .promise();

    // Map task descriptions to a more readable format
    const containerData = taskDescriptions.tasks.map((task) => ({
      containerGroupName: task.group || "N/A",
      containers: task.containers.map((container) => ({
        name: container.name,
        image: container.image,
        ports: container.ports.map((port) => ({
          protocol: port.protocol,
          port: port.containerPort,
        })),
        resources: {
          cpu: container.cpu || "N/A",
          memoryInGB: (container.memory || 0) / 1024, // Convert memory from MiB to GiB
        },
      })),
    }));

    res.json(containerData);
  } catch (error) {
    console.error("Error fetching AWS containers:", error);
    next(error); // Pass the error to the error-handling middleware
  }
});

// Endpoint to fetch AWS ECS clusters in a selected region
router.get("/clusters", async (req, res, next) => {
  const { awsRegion } = req.query;

  if (!awsRegion) {
    return res.status(400).json({ error: "AWS region is required" });
  }

  // Update AWS region based on the request
  AWS.config.update({ region: awsRegion });
  const ecs = new AWS.ECS();

  try {
    // List ECS clusters
    const { clusterArns } = await ecs.listClusters().promise();

    if (clusterArns.length === 0) {
      return res.status(404).json({ error: "No clusters found in the region" });
    }

    // Describe clusters to get detailed information
    const clusterDescriptions = await ecs
      .describeClusters({ clusters: clusterArns })
      .promise();

    const clustersData = clusterDescriptions.clusters.map((cluster) => ({
      clusterName: cluster.clusterName,
      status: cluster.status,
      createdAt: cluster.createdAt,
      numberOfServices: cluster.activeServicesCount,
      numberOfTasks: cluster.runningTasksCount,
    }));

    res.json(clustersData);
  } catch (error) {
    console.error("Error fetching AWS clusters:", error);
    next(error); // Pass the error to the error-handling middleware
  }
});

module.exports = router;

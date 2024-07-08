const express = require("express");
const router = express.Router();
const { checkAllContainers } = require("../utils");
require("dotenv").config();
const { SubscriptionClient } = require("@azure/arm-resources-subscriptions");
const {
  ContainerInstanceManagementClient,
} = require("@azure/arm-containerinstance");
const { ResourceManagementClient } = require("@azure/arm-resources");
const { DefaultAzureCredential } = require("@azure/identity");

// const azureSubscriptionId =
//   process.env.AZURE_SUBSCRIPTION_ID || "your-subscription-id";
// const resourceGroupName =
//   process.env.RESOURCE_GROUP_NAME || "your-resource-group-name";

async function fetchSubscriptions() {
  const credential = new DefaultAzureCredential();
  const client = new SubscriptionClient(credential);

  const subscriptions = [];
  for await (const subscription of client.subscriptions.list()) {
    subscriptions.push(subscription);
  }
  return subscriptions;
}

async function fetchResourceGroups(subscriptionId) {
  const credential = new DefaultAzureCredential();
  const client = new ResourceManagementClient(credential, subscriptionId);

  const resourceGroups = [];
  for await (const resourceGroup of client.resourceGroups.list()) {
    resourceGroups.push(resourceGroup);
  }
  return resourceGroups;
}

// GET endpoint to return subscriptions
router.get("/subscriptions", async (req, res, next) => {
  try {
    const subscriptions = await fetchSubscriptions();
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    next(error);
  }
});

router.get("/resourcegroups", async (req, res, next) => {
  try {
    const subscriptionId = req.query.subscriptionId;
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }
    const resourceGroups = await fetchResourceGroups(subscriptionId);
    res.status(200).json(resourceGroups);
  } catch (error) {
    console.error("Error fetching resource groups:", error);
    next(error);
  }
});

router.post("/subscription-details", async (req, res, next) => {
  try {
    const { SubscriptionResource } = req.app.get("models");
    const { selectedSubscription, selectedResourceGroup } = req.body;

    // Save data to the database using Sequelize model
    const newSubscriptionResource = await SubscriptionResource.create({
      subscriptionId: selectedSubscription.value,
      resourceLabel: selectedResourceGroup.label,
    });

    // Respond with a success message or updated data
    res.status(201).json({
      message: "Subscription details saved successfully",
      subscriptionResource: newSubscriptionResource,
    });
  } catch (error) {
    console.error("Error saving subscription details:", error);
    next(error);
  }
});

router.get("/containers", async (req, res, next) => {
  const { azureSubscriptionId, resourceGroupName } = req.query;
  if (!azureSubscriptionId || !resourceGroupName) {
    return res.status(400).json({
      error:
        "Azure subscription ID or resource group name is missing or undefined.",
    });
  }

  const client = new ContainerInstanceManagementClient(
    new DefaultAzureCredential(),
    azureSubscriptionId
  );

  const containerDetailsList = [];

  try {
    const containerGroupsIterator =
      client.containerGroups.listByResourceGroup(resourceGroupName);

    for await (const containerGroupsPage of containerGroupsIterator.byPage()) {
      for (const containerGroup of containerGroupsPage) {
        const containerGroupDetails = {
          name: containerGroup.name,
          containers: [],
        };

        if (containerGroup.containers) {
          for (const container of containerGroup.containers) {
            const containerDetails = {
              name: container.name,
              image: container.image,
              ports: container.ports.map((port) => ({
                protocol: port.protocol,
                port: port.port,
              })),
              environmentVariables: container.environmentVariables.map(
                (envVar) => ({
                  name: envVar.name,
                  value: envVar.value,
                })
              ),
              resources: {
                cpu: container.resources.requests.cpu,
                memoryInGB: container.resources.requests.memoryInGB,
              },
            };
            containerGroupDetails.containers.push(containerDetails);
          }
        }

        containerDetailsList.push(containerGroupDetails);
      }
    }

    return res.status(200).json(containerDetailsList);
  } catch (error) {
    // console.error("An error occurred:", error);
    next(error);
  }
});

module.exports = router;

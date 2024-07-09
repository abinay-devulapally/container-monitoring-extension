const {
  ContainerInstanceManagementClient,
} = require("@azure/arm-containerinstance");
const { DefaultAzureCredential } = require("@azure/identity");

const AZURE_SUBSCRIPTION_ID =
  process.env.AZURE_SUBSCRIPTION_ID || "your-subscription-id";
const RESOURCE_GROUP_NAME =
  process.env.RESOURCE_GROUP_NAME || "your-resource-group-name";

async function listAzureContainerGroups(req, res) {
  if (!AZURE_SUBSCRIPTION_ID || !RESOURCE_GROUP_NAME) {
    return res.status(400).json({
      error:
        "Azure subscription ID or resource group name is missing or undefined.",
    });
  }

  const client = new ContainerInstanceManagementClient(
    new DefaultAzureCredential(),
    AZURE_SUBSCRIPTION_ID
  );

  const containerDetailsList = [];

  try {
    const containerGroupsIterator =
      client.containerGroups.listByResourceGroup(RESOURCE_GROUP_NAME);

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
    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = { listAzureContainerGroups };

import React, { useState, useEffect } from "react";
import AzureInputModal from "./AzureInputModal";
import LoadingSpinner from "./LoadingSpinner";
import AppError from "../utils/AppError";
import ErrorComponent from "./ErrorComponent";

localStorage.removeItem("lastSubscriptionId");
localStorage.removeItem("lastResourceGroup", "");

const fetchContainers = async ({ azureSubscriptionId, resourceGroupName }) => {
  if (!azureSubscriptionId || !resourceGroupName) {
    throw new AppError(
      "Azure subscription ID and resource group name are required",
      400
    );
  }
  const response = await fetch(
    `http://localhost:8000/api/v1/azure/containers?azureSubscriptionId=${azureSubscriptionId}&resourceGroupName=${resourceGroupName}`
  );
  if (!response.ok) {
    throw new AppError("Network response was not ok", response.status);
  }
  return response.json();
};

const AllContainers = ({
  containerGroupName,
  containerName,
  containerImage,
  containerPorts,
  containerCPUUsage,
  containerMemoryUsage,
}) => {
  const displayName = containerName.replace("/", "");
  return (
    <div className="bg-gray-950 text-white shadow-lg rounded-lg overflow-hidden mb-4">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-orange-800">
          {containerGroupName}
        </div>
        <div>
          <div className="font-bold mb-2">{displayName}</div>
          <p className="text-sm italic mb-2">Image: {containerImage}</p>
          {containerCPUUsage && (
            <p className="text-sm italic mb-2">
              CPU Usage: {containerCPUUsage} %
            </p>
          )}
          {containerMemoryUsage && (
            <p className="text-sm italic mb-2">
              Memory Usage: {containerMemoryUsage} GB
            </p>
          )}
          {containerPorts && containerPorts.length > 0 && (
            <div>
              <h4 className="text-sm italic mb-2">Ports:</h4>
              <ul className="list-disc list-inside">
                {containerPorts.map((port, index) => (
                  <li key={index} className="text-sm italic mb-2">
                    {port.protocol}: {port.port}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AzureContainers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    azureSubscriptionId: localStorage.getItem("lastSubscriptionId") || "",
    resourceGroupName: localStorage.getItem("lastResourceGroup") || "",
  });
  const [initialMessage, setInitialMessage] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  //   const handleSubmit = async (FormDetails) => {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:8000/api/v1/azure/subscription-details",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(FormDetails),
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to submit subscription details");
  //       }

  //       console.log("Subscription details submitted successfully");
  //     } catch (error) {
  //       console.error("Error submitting subscription details:", error.message);
  //     }
  //   };

  const handleSubmit = (formDetails) => {
    const { selectedSubscription, selectedResourceGroup } = formDetails;

    setSubscriptionDetails({
      azureSubscriptionId: selectedSubscription.value,
      resourceGroupName: selectedResourceGroup.label,
    });

    localStorage.setItem("lastSubscriptionId", selectedSubscription.value);
    localStorage.setItem("lastResourceGroup", selectedResourceGroup.label);

    setInitialMessage("");
    setLoading(true);
    setIsModalOpen(false); // Close modal after submission
  };

  function handleReload() {
    setReload((prev) => !prev);
    setLoading(true);
  }

  useEffect(() => {
    const getContainers = async () => {
      try {
        setError(null);
        const data = await fetchContainers(subscriptionDetails);
        setContainers(data);
      } catch (err) {
        if (
          err.message ===
          "Azure subscription ID and resource group name are required"
        ) {
          setInitialMessage(
            "Ensure Azure CLI is installed and you're logged in, then select a subscription ID and resource group."
          );
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    getContainers();
  }, [reload, subscriptionDetails]);

  function renderContent() {
    if (error) {
      return <ErrorComponent message={error} />;
    }
    if (initialMessage) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-zinc-300 italic">{initialMessage}</p>
        </div>
      );
    }

    if (loading) {
      return <LoadingSpinner />;
    }

    if (containers.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {containers.map((group) => (
            <React.Fragment key={group.name}>
              {group.containers.map((container) => (
                <AllContainers
                  key={container.name}
                  containerGroupName={group.name}
                  containerName={container.name}
                  containerImage={container.image}
                  containerPorts={container.ports}
                  containerCPUUsage={container.resources.cpu}
                  containerMemoryUsage={container.resources.memoryInGB}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Default message when no containers are available
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-zinc-300 italic">
          No Container Instances for Resource Group
        </p>
      </div>
    );
  }

  return (
    <div>
      {" "}
      <div className="flex justify-between items-center text-3xl font-bold mb-4 text-white">
        <p>Azure Container Instances</p>
        <div className="flex space-x-3 ml-auto">
          <span>
            <button
              className="flex items-center px-2 py-1 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-80"
              onClick={handleReload}
            >
              <svg
                className="w-4 h-4 mx-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
              <span className="mx-1">Refresh</span>
            </button>
          </span>
          <span>
            <button
              className="flex items-center px-2 py-1 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-200 focus:ring-opacity-80"
              onClick={handleOpenModal}
            >
              <span className="mx-1">Select Subscription</span>
            </button>
            <AzureInputModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmit}
            />
          </span>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default AzureContainers;

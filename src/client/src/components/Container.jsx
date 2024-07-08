import React, { useState, useEffect } from "react";

import ErrorComponent from "./ErrorComponent";
import Modal from "./Modal"; // Adjust path as necessary

const CACHE_KEY = "containerData";

localStorage.removeItem("containerData");

async function fetchAllContainers() {
  try {
    const response = await fetch("http://localhost:8000/api/v1/containers/all");
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function AllContainers({
  containerName,
  containerImage,
  containerStatus,
  containerState,
  containerCreated,
  containerPorts,
  containerLabels,
  containerNetworkMode,
  containerIPAddress,
  containerCPUUsage,
  containerMemoryUsage,
  containerRestartCount,
  containerMounts,
  containerLogs,
  containerHealthCheck,
  setDebug,
}) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const displayName = containerName.replace("/", "");

  return (
    <>
      <div className="bg-gray-950 text-white shadow-lg rounded-lg overflow-hidden mb-4">
        <div className="px-6 py-4">
          <div>
            <div className="font-bold text-2xl mb-2">{displayName}</div>
            <p className="text-sm italic mb-2">Image: {containerImage}</p>
            {containerHealthCheck === "N/A" ? (
              <p className="text-sm text-yellow-200">Healthcheck not enabled</p>
            ) : (
              <p
                className={`text-sm ${
                  containerStatus.includes("unhealthy") ||
                  containerStatus.includes("running")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                Status: {containerStatus}
              </p>
            )}
            {containerState === "running" ? (
              <p className="text-sm italic mb-2 text-green-500">
                State: {containerState}
              </p>
            ) : (
              <p className="text-sm italic mb-2 text-red-500">
                State: {containerState}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={openModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Details
            </button>
            {containerStatus.includes("unhealthy") ? (
              <button
                onClick={() =>
                  setDebug(
                    `${displayName} Healthcheck failed explain how to resolve it`
                  )
                }
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Debug
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        container={{
          displayName,
          containerImage,
          containerStatus,
          containerState,
          containerCreated,
          containerPorts,
          containerLabels,
          containerNetworkMode,
          containerIPAddress,
          containerCPUUsage,
          containerMemoryUsage,
          containerRestartCount,
          containerMounts,
          containerLogs,
          containerHealthCheck,
        }}
      />
    </>
  );
}

const ContainerList = ({ containers, setDebug }) => (
  <>
    {containers.length === 0 ? (
      <div className="flex justify-center items-center h-screen">
        <p className="text-zinc-300 italic">No containers to display</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {containers.map((container) => (
          <AllContainers
            key={container.Id}
            containerId={container.Id}
            containerName={
              container.Name + " (" + container.Id.slice(0, 12) + ")"
            }
            containerImage={container.Image}
            containerStatus={container.Status}
            containerState={container.State}
            containerCreated={container.Created}
            containerPorts={container.Ports}
            containerLabels={container.Labels}
            containerNetworkMode={container.NetworkMode}
            containerIPAddress={container.IPAddress}
            containerCPUUsage={container.CPUUsage}
            containerMemoryUsage={container.MemoryUsage}
            containerRestartCount={container.RestartCount}
            containerMounts={container.Mounts}
            containerLogs={container.Logs}
            containerHealthCheck={container.HealthCheck}
            setDebug={setDebug}
          />
        ))}
      </div>
    )}
  </>
);

function Container({ setDebug }) {
  const [allContainers, setAllContainers] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function processContainerData() {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setAllContainers(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const fetchedData = await fetchAllContainers();
          localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
          setAllContainers(fetchedData);
          setLoading(false);
        }
      } catch (error) {
        // console.error("Error fetching container data:", error);
        setError(
          "Failed to fetch data from the backend server. Please try again later."
        );
        // Handle the error here, e.g. set an error state or show a message to the user
      }
    }
    processContainerData();
  }, [reload]);
  if (error) {
    return <ErrorComponent />;
  }

  function handleReload() {
    localStorage.removeItem(CACHE_KEY);
    setReload((prev) => !prev);
    setLoading(true);
  }
  return (
    <div>
      <div className="flex space-x-3 text-3xl font-bold mb-4 text-white">
        <p>Containers Management</p>
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
      </div>
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <p className="text-zinc-300 italic">Loading...</p>
        </div>
      )}
      <ContainerList containers={allContainers} setDebug={setDebug} />
      {/* <ContainerFailedList containers={containerData} setDebug={setDebug} /> */}
    </div>
  );
}

export default Container;

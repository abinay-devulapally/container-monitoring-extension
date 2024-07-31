import React, { useState, useEffect } from "react";

import ErrorComponent from "./ErrorComponent";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import AppError from "../utils/AppError";

const CACHE_KEY = "containerData";

localStorage.removeItem("containerData");

async function fetchAllContainers() {
  const response = await fetch("http://localhost:8000/api/v1/containers/all");
  if (!response.ok) {
    throw new AppError("Failed to fetch data", response.status);
  }
  const data = await response.json();
  return data;
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs rounded"
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
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs rounded"
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
          containerHealthCheck,
        }}
      />
    </>
  );
}

const ContainerList = ({ containers, setDebug }) => (
  <>
    {containers.length === 0 ? (
      <div className="flex justify-center items-center h-64">
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
            containerHealthCheck={container.HealthCheck}
            setDebug={setDebug}
          />
        ))}
      </div>
    )}
  </>
);

const ContainerRow = ({
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
  containerHealthCheck,
  setDebug,
}) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const displayName = containerName.replace("/", "");

  const getStatusColorClass = () => {
    if (containerStatus.includes("unhealthy")) {
      return "text-red-500";
    } else {
      return "text-green-500";
    }
  };

  const getStateColorClass = () => {
    return containerState === "running" ? "text-green-500" : "text-red-500";
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-2 bg-gray-950 p-4 rounded-lg shadow-lg mb-4">
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold text-lg tooltip truncate-container">
          <span className="tooltiptext">{displayName}</span>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm italic tooltip truncate-container">
          <span className="tooltiptext">{containerImage}</span>
        </div>
        <div
          className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm ${getStatusColorClass()}`}
        >
          Status: {containerStatus}
        </div>
        <div
          className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-1 text-sm ${getStateColorClass()}`}
        >
          State: {containerState}
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm">
          Created: {new Date(containerCreated).toLocaleString()}
        </div>
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-2 flex justify-end space-x-2">
          <button
            onClick={() => setDebug(`${displayName} Restart action`)}
            className="flex items-center space-x-1 text-green-200 bg-gray-800 py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
          </button>

          <button
            onClick={() => setDebug(`${displayName} Start action`)}
            className="flex items-center space-x-1 text-green-500 bg-gray-800 py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <button
            onClick={() => setDebug(`${displayName} Stop action`)}
            className="flex flex-col items-center m-4 text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="action-icon"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>

          <button
            onClick={openModal}
            className="flex flex-col items-center m-4 text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="action-icon"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          {containerStatus.includes("unhealthy") ? (
            <button
              onClick={() =>
                setDebug(
                  `${displayName} Healthcheck failed explain how to resolve it`
                )
              }
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs rounded"
            >
              Debug
            </button>
          ) : null}
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
          containerHealthCheck,
        }}
      />
    </>
  );
};

const ContainerListNew = ({ containers, setDebug }) => {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold">
          Container Name
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold">
          Image
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold">
          Status
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-1 font-bold">
          State
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold">
          Created
        </div>
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-2 font-bold text-right">
          Actions
        </div>
      </div>

      <div
        id="container-list"
        className="overflow-auto text-white"
        style={{ maxHeight: "500px" }}
      >
        {containers.map((container) => (
          <ContainerRow
            key={container.Id}
            containerName={container.Name}
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
            containerHealthCheck={container.HealthCheck}
            setDebug={setDebug}
          />
        ))}
      </div>
    </div>
  );
};

function Container({ setDebug }) {
  const [allContainers, setAllContainers] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function processContainerData() {
      try {
        setError(null);
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
        console.error("Error fetching container data:", error);
        setError(
          "Failed to fetch data from the backend server. Please try again later."
        );
      }
    }
    processContainerData();
  }, [reload]);

  function handleReload() {
    localStorage.removeItem(CACHE_KEY);
    setReload((prev) => !prev);
    setLoading(true);
  }
  return (
    <div>
      <div className="flex items-center space-x-3 text-3xl font-bold mb-4 text-white">
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
      {error ? (
        <ErrorComponent message={error} debug={true} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <ContainerListNew containers={allContainers} setDebug={setDebug} />
      )}
    </div>
  );
}

export default Container;

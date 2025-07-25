import React, { useState, useEffect } from "react";

import ErrorComponent from "./ErrorComponent";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import AppError from "../utils/AppError";

const CACHE_KEY = "containerData";

sessionStorage.removeItem("containerData");

async function fetchAllContainers() {
  const response = await fetch("http://localhost:8000/api/v1/container/all"); // <-- change "containers" to "container"
  if (!response.ok) {
    throw new AppError("Failed to fetch data", response.status);
  }
  const data = await response.json();
  return data;
}

// Add this function to fetch search results from the backend
async function searchContainers({ name, image, status }) {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (image) params.append("image", image);
  if (status) params.append("status", status);

  const response = await fetch(
    `http://localhost:8000/api/v1/container/search?${params.toString()}`
  );
  if (!response.ok) {
    throw new AppError("Failed to search containers", response.status);
  }
  return await response.json();
}

const Notification = ({ id, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 2000); // Hide notification after 2 seconds

    return () => clearTimeout(timer); // Cleanup on component unmount
  }, [id, onClose]);

  const { messageText, type } = message;

  let notificationClass = "bg-blue-500";
  if (type === "error") {
    notificationClass = "bg-red-500";
  }

  return (
    <div
      className={`fixed bottom-${
        4 + id * 60
      } right-4 ${notificationClass} text-white px-4 py-2 rounded shadow-lg`}
    >
      <span>{messageText}</span>
      <button onClick={() => onClose(id)} className="ml-4 text-lg">
        &times;
      </button>
    </div>
  );
};

const ContainerRow = ({
  containerId,
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
  refreshContainers,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]); // State for notification

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/container/${action}/${containerId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new AppError(`Failed to ${action} container`, response.status);
      }
      await response.json();
      refreshContainers(); // Refresh the list after performing the action
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(), // Unique ID based on timestamp
          messageText: `${
            action.charAt(0).toUpperCase() + action.slice(1)
          } action completed for ${displayName}.`,
          type: "success",
        },
      ]); // Show notification
    } catch (error) {
      console.error(`Error ${action} container:`, error);
      // setDebug(`${containerName} failed to ${action}. ${error.message}`);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          messageText: `Failed to ${action} ${displayName}.`,
          type: "error",
        },
      ]); // Show notification
    } finally {
      setLoading(false);
    }
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
      <div className="items-center grid grid-cols-12 gap-2 bg-gray-950 p-4 rounded-lg shadow-lg mb-4">
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold text-lg tooltip truncate-container">
          <span className="tooltiptext">{displayName}</span>
          {displayName}
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm italic tooltip truncate-container">
          <span className="tooltiptext">{containerImage}</span>
          {containerImage}
        </div>
        <div
          className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm ${getStatusColorClass()}`}
        >
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
              {containerStatus}
            </p>
          )}
        </div>
        <div
          className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-1 text-sm ${getStateColorClass()}`}
        >
          {containerState}
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 text-sm">
          {new Date(containerCreated).toLocaleString()}
        </div>
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-2 flex justify-end space-x-2">
          <button
            onClick={() => handleAction("restart")}
            className="flex items-center space-x-1 text-green-200"
            disabled={loading}
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
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
          </button>

          <button
            onClick={() => handleAction("start")}
            className="flex flex-col items-center m-4 text-green-500"
            disabled={loading}
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
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <button
            onClick={() => handleAction("stop")}
            className="flex flex-col items-center m-4 text-red-500"
            disabled={loading}
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
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 text-xs rounded"
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
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification}
          onClose={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
        />
      ))}
    </>
  );
};

const ContainerListNew = ({ containers, refreshContainers, setDebug }) => {
  return (
    <>
      {containers.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-zinc-300 italic">No containers to display</p>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
            <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 font-bold">
              Name
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
                containerId={container.Id}
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
                refreshContainers={refreshContainers}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

function Container({ setDebug }) {
  const [allContainers, setAllContainers] = useState([]);
  const [filter, setFilter] = useState("running");
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchImage, setSearchImage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function processContainerData() {
      try {
        setError(null);
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setAllContainers(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const fetchedData = await fetchAllContainers();
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
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
    sessionStorage.removeItem(CACHE_KEY);
    setReload((prev) => !prev);
    setLoading(true);
  }

  const refreshContainers = async () => {
    try {
      const fetchedData = await fetchAllContainers();
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
      setAllContainers(fetchedData);
    } catch (error) {
      console.error("Error refreshing containers:", error);
      setDebug("Failed to refresh container data. " + error.message);
    }
  };

  // New: handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearching(true);
    try {
      const results = await searchContainers({
        name: searchTerm,
        image: searchImage,
        status: searchStatus,
      });
      setAllContainers(results);
    } catch (error) {
      setError("Failed to search containers. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // New: handle clear search
  const handleClearSearch = async () => {
    setSearchTerm("");
    setSearchImage("");
    setSearchStatus("");
    setIsSearching(false);
    handleReload();
  };

  const filteredContainers = allContainers.filter((container) => {
    if (filter === "running") return container.State === "running";
    if (filter === "exited") return container.State === "exited";
    return true;
  });

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
        <div className="flex items-center px-2 py-1 text-sm">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            <option value="all">All</option>
            <option value="running">Running</option>
            <option value="exited">Exited</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center space-x-2 mb-4"
      >
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Search by image"
          value={searchImage}
          onChange={(e) => setSearchImage(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Search by status"
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded mb-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
        >
          Search
        </button>
        {isSearching && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="bg-gray-500 text-white px-4 py-2 rounded mb-2"
          >
            Clear
          </button>
        )}
      </form>

      {error ? (
        <ErrorComponent message={error} debug={true} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <ContainerListNew
          containers={filteredContainers}
          refreshContainers={refreshContainers}
          setDebug={setDebug}
        />
      )}
    </div>
  );
}

export default Container;

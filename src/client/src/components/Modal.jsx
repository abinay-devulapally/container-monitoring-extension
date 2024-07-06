import React from "react";
import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, container }) => {
  if (!isOpen) return null;

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  // Function to format the date into a human-readable string
  function formatDateTime(timestamp) {
    // Ensure timestamp is valid and numeric
    if (typeof timestamp === "number" && !isNaN(timestamp)) {
      const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
      if (isValidDate(date)) {
        return date.toLocaleString(); // Adjust format as per your locale and preference
      }
    }
    return "Invalid Date";
  }

  const {
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
  } = container;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-900 text-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-700 rounded-t">
            <h3 className="text-3xl font-semibold">{displayName}</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-white opacity-75 hover:opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="text-white h-6 w-6 text-3xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <div className="relative bg-black p-6 flex-auto max-h-96 overflow-y-auto">
            <p className="my-4 text-gray-400 text-lg leading-relaxed">
              Image: {containerImage}
            </p>
            <p className="text-lg font-bold">
              Created:{" "}
              <span className="text-sm font-thin text-green-500">
                {formatDateTime(containerCreated)}
              </span>
            </p>
            <p className="text-lg font-bold">
              Network Mode:{" "}
              <span className="text-sm font-thin text-green-500">
                {containerNetworkMode}
              </span>
            </p>
            <p className="text-lg font-bold">
              IP Address:{" "}
              {containerIPAddress ? (
                <span className="font-thin text-green-500">
                  {containerIPAddress}
                </span>
              ) : (
                <span className="text-sm font-thin">Not Available</span>
              )}
            </p>
            <p className="text-lg font-bold">
              CPU Usage:{" "}
              {!containerCPUUsage.includes("NaN") ? (
                <span className="text-sm font-thin text-green-500">
                  {containerCPUUsage}
                </span>
              ) : (
                <span className="text-sm font-thin">Not Available</span>
              )}
            </p>
            <p className="text-lg font-bold">
              Memory Usage:{" "}
              {!containerMemoryUsage.includes("NaN") ? (
                <span className="text-sm font-thin text-green-500">
                  {containerMemoryUsage}
                </span>
              ) : (
                <span className="text-sm font-thin">Not Available</span>
              )}
            </p>
            <p className="text-lg font-bold">
              Restart Count:{" "}
              <span className="text-sm font-thin text-green-500">
                {containerRestartCount}
              </span>
            </p>
            <div className="mt-4">
              <p className="text-lg font-bold">
                Ports:{" "}
                <span className="text-xs italic text-gray-400">
                  {" "}
                  Source → Destination
                </span>
              </p>
              <div className="ml-4">
                {Object.keys(containerPorts).length !== 0 ? (
                  <>
                    {" "}
                    {Object.entries(containerPorts).map(
                      ([key, value], index) => (
                        <p key={index} className="text-lg">
                          <span className="text-yellow-100">{key}</span> →{" "}
                          <span className="text-green-500">
                            {value[0].HostPort}
                          </span>
                        </p>
                      )
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-400">No Ports Maped</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg font-bold">
                Mounts:{" "}
                <span className="text-xs italic text-gray-400">
                  {" "}
                  Source → Destination
                </span>
              </p>
              <div className="ml-4">
                <div className="ml-4">
                  {containerMounts.map((mount, index) => (
                    <p key={index} className="text-sm">
                      <span className="text-yellow-100">{mount.Source}</span> →{" "}
                      <span className="text-green-500">
                        {mount.Destination}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg font-bold">Labels:</p>
              <div className="ml-4">
                {Object.entries(containerLabels).map(([key, value], index) => (
                  <p key={index} className="text-sm">
                    <span className="text-yellow-100">{key}</span>:{" "}
                    <span className="text-green-500"> {value}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Add more details as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  container: PropTypes.object.isRequired,
};

export default Modal;

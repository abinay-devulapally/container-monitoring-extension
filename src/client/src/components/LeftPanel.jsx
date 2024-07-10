import React, { useEffect } from "react";

function LeftPanel({
  activePanel,
  alertData,
  alarmData,
  handlePanelClick,
  debug,
  setDebug,
}) {
  const alertLength = alertData.length;
  const alarmLength = alarmData.length;

  useEffect(() => {
    if (debug.debug) {
      handlePanelClick("chat");
      activePanel === "chat" && setDebug({ debug: false });
    }
  }, [debug, activePanel]);

  return (
    <div className="bg-gray-800 text-white w-1/4 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard Menu</h2>
      <ul className="space-y-2">
        <li>
          <a
            className={`block py-2 px-4 rounded hover:bg-gray-700 ${
              activePanel === "containers" ? "bg-gray-700" : ""
            }`}
            onClick={() => handlePanelClick("containers")}
          >
            Containers{"  "}
            {alarmLength > 0 && (
              <span className="text-red-600 text-sm">{alarmLength}</span>
            )}
          </a>
        </li>
        <li>
          <a
            className={`block py-2 px-4 rounded hover:bg-gray-700 ${
              activePanel === "alerts" ? "bg-gray-700" : ""
            }`}
            onClick={() => handlePanelClick("alerts")}
          >
            Alerts{" "}
            {alertLength > 0 && (
              <span className="text-yellow-500 text-sm">{alertLength}</span>
            )}
          </a>
        </li>
        <li>
          <a
            className={`block py-2 px-4 rounded hover:bg-gray-700 ${
              activePanel === "alarms" ? "bg-gray-700" : ""
            }`}
            onClick={() => handlePanelClick("alarms")}
          >
            Alarms{" "}
            {alarmLength > 0 && (
              <span className="text-red-600 text-sm">{alarmLength}</span>
            )}
          </a>
        </li>
        <li>
          <a
            className={`block py-2 px-4 space-x-2 rounded hover:bg-gray-700 ${
              activePanel === "metrics" ? "bg-gray-700" : ""
            }`}
            onClick={() => handlePanelClick("metrics")}
          >
            <span>Metrics</span>
            <span className="text-xs italic">Currently not available</span>
          </a>
        </li>
        <li>
          <a
            className={`block py-2 px-4 space-x-2 rounded hover:bg-gray-700 ${
              activePanel === "chat" ? "bg-gray-700" : ""
            }`}
            onClick={() => handlePanelClick("chat")}
          >
            <span>Chat</span>
            {/* <span className="text-xs italic">Currently not available</span> */}
          </a>
        </li>
      </ul>
    </div>
  );
}

export default LeftPanel;

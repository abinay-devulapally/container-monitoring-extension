import React, { useState, useEffect } from "react";

import LeftPanel from "./components/LeftPanel.jsx";
import RightPanel from "./components/RightPanel.jsx";
import ErrorComponent from "./components/ErrorComponent.jsx";

import AppError from "./utils/AppError.js";

console.log("In App component");

const PROMPT =
  "As a seasoned Docker practitioner well-versed in health checks, container lifecycle management, and advanced Docker configurations, elucidate the root cause behind an error arising from unsupported user-based queries in Docker. Provide insights into best practices and alternative approaches to mitigate such issues effectively. So Now understand this : ";

const App = () => {
  const [activePanel, setActivePanel] = useState("containers");
  const [alertData, setAlertData] = useState([]);
  const [alarmData, setAlarmData] = useState([]);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({
    debug: false,
    prompt: PROMPT,
    debugDetails: "",
  });

  function handleDebugClick(containerDetails) {
    setDebug((prevState) => ({
      ...prevState,
      debug: !prevState.debug,
      prompt: PROMPT,
      debugDetails: containerDetails,
    }));
  }

  const handlePanelClick = (target) => {
    setActivePanel(target);
  };

  useEffect(() => {
    async function processAlertData() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/alerts");
        if (!response.ok) {
          const errorData = await response.json();
          throw new AppError(errorData.message, response.status);
        }
        const fetchedData = await response.json();
        const modifiedData = fetchedData.filter(
          (data) => data.isAlarm === true
        );

        setAlertData(fetchedData);
        setAlarmData(modifiedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.statusCode === 404) {
          setError(
            "Failed to fetch data, please check request URL and try again."
          );
        } else {
          setError(`Failed to fetch data with error: ${error.message}`);
        }
      }
    }

    processAlertData();
  }, [activePanel]);

  return (
    <div className="flex">
      <LeftPanel
        activePanel={activePanel}
        alertData={alertData}
        alarmData={alarmData}
        handlePanelClick={handlePanelClick}
        debug={debug}
        setDebug={handleDebugClick}
      />
      <RightPanel
        error={error}
        activePanel={activePanel}
        alertData={alertData}
        alarmData={alarmData}
        debug={debug}
        setDebug={handleDebugClick}
      />
    </div>
  );
};

export default App;

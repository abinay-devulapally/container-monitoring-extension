import React, { useState, useEffect } from "react";

import LeftPanel from "./components/LeftPanel.jsx";
import RightPanel from "./components/RightPanel.jsx";
import { fetchData, fetchAllContainers } from "./utils/helper.js";

console.log("In App component");

const PROMPT =
  "As a seasoned Docker practitioner well-versed in health checks, container lifecycle management, and advanced Docker configurations, elucidate the root cause behind an error arising from unsupported user-based queries in Docker. Provide insights into best practices and alternative approaches to mitigate such issues effectively. So Now understand this : ";

const App = () => {
  const [activePanel, setActivePanel] = useState("containers");
  const [alertData, setAlertData] = useState([]);
  const [alarmData, setAlarmData] = useState([]);
  const [containerData, setContainerData] = useState([]);
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
    let modifiedData;
    async function processAlertData() {
      const fetchedData = await fetchData();
      const fetchContainerData = [];
      fetchedData.forEach((element) => {
        const containerName = element.service;
        const containerDetails = element.details;
        fetchContainerData.push({ containerName, containerDetails });
      });
      modifiedData = fetchedData.filter((data) => data.isAlarm === true);
      setAlertData(fetchedData);
      setAlarmData(modifiedData);
      setContainerData(fetchContainerData);
    }
    processAlertData();
  }, [activePanel]);

  return (
    <div class="flex">
      <LeftPanel
        activePanel={activePanel}
        alertData={alertData}
        alarmData={alarmData}
        handlePanelClick={handlePanelClick}
        debug={debug}
        setDebug={handleDebugClick}
      />
      <RightPanel
        activePanel={activePanel}
        alertData={alertData}
        alarmData={alarmData}
        containerData={containerData}
        debug={debug}
        setDebug={handleDebugClick}
      />
    </div>
  );
};

export default App;

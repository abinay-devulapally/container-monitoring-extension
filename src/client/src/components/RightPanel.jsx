import React, { useState, lazy, Suspense, useEffect } from "react";
import Container from "./Container";
import AzureContainers from "./AzureContainers";
import Alerts from "./Alerts";
import Alarms from "./Alarms";

const Metrics = lazy(() => import("./Metrics"));
import Chat from "./Chat";

function SubAlertSidePanel({ handleNavigation, currentPage }) {
  return (
    <div className="flex items-center justify-start bg-gray-900 p-2 -m-4">
      <ul className="flex space-x-4 text-white  list-none m-0 p-2">
        <li>
          <a
            onClick={() => handleNavigation("alerts")}
            className={`rounded-md px-3 py-2 font-medium  ${
              currentPage === "alerts" ? "bg-gray-700" : ""
            }`}
          >
            Alerts
          </a>
        </li>
        <li>
          <a
            onClick={() => handleNavigation("prometheus")}
            className={`rounded-md px-3 py-2 font-medium ${
              currentPage === "prometheus" ? "bg-gray-700" : ""
            }`}
          >
            Prometheus
          </a>
        </li>
        <li>
          <a
            onClick={() => handleNavigation("projects")}
            className={`rounded-md px-3 py-2 font-medium ${
              currentPage === "projects" ? "bg-gray-700" : ""
            }`}
          >
            Projects
          </a>
        </li>
      </ul>
    </div>
  );
}

function SubContainerSidePanel({ handleNavigation, currentPage }) {
  return (
    <div className="flex items-center justify-start bg-gray-900 p-2 -m-4">
      <ul className="flex space-x-4 text-white  list-none m-0 p-2">
        <li>
          <a
            onClick={() => handleNavigation("containers")}
            className={`rounded-md px-3 py-2 font-medium  ${
              currentPage === "containers" ? "bg-gray-700" : ""
            }`}
          >
            Containers
          </a>
        </li>
        <li>
          <a
            onClick={() => handleNavigation("Azure Containers")}
            className={`rounded-md px-3 py-2 font-medium ${
              currentPage === "Azure Containers" ? "bg-gray-700" : ""
            }`}
          >
            Azure Containers
          </a>
        </li>
      </ul>
    </div>
  );
}

function RightContainerSidePanel({ setDebug, handleNavigation, currentPage }) {
  return (
    <>
      <SubContainerSidePanel
        handleNavigation={handleNavigation}
        currentPage={currentPage}
      />
      <div className="mt-8">
        {currentPage === "containers" && <Container setDebug={setDebug} />}
        {currentPage === "Azure Containers" && <AzureContainers />}
      </div>
    </>
  );
}

function RightAlertSidePanel({
  error,
  handleNavigation,
  currentPage,
  alertData,
}) {
  return (
    <>
      <SubAlertSidePanel
        handleNavigation={handleNavigation}
        currentPage={currentPage}
      />
      <div className="mt-8">
        {currentPage === "alerts" && (
          <Alerts error={error} alertData={alertData} />
        )}
        {currentPage === "prometheus" && (
          <div>This is prometheus AlertManager Page</div>
        )}
      </div>
    </>
  );
}

function RightPanel({
  error,
  activePanel,
  alertData,
  alarmData,
  debug,
  setDebug,
}) {
  const [currentPage, setCurrentPage] = useState(activePanel); // State to track current page

  useEffect(() => {
    setCurrentPage(activePanel);
  }, [activePanel]);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-3/4 p-4 bg-gray-500">
      {activePanel === "containers" && (
        <RightContainerSidePanel
          setDebug={setDebug}
          handleNavigation={handleNavigation}
          currentPage={currentPage}
        />
      )}
      {/* {activePanel === "containers" && (
        <Container containerData={containerData} setDebug={setDebug} />
      )} */}
      {activePanel === "alerts" && (
        <RightAlertSidePanel
          error={error}
          alertData={alertData}
          handleNavigation={handleNavigation}
          currentPage={currentPage}
        />
      )}
      {/* {activePanel === "alerts" && <Alerts alertData={alertData} />} */}
      {activePanel === "alarms" && (
        <Alarms error={error} alarmData={alarmData} />
      )}
      {activePanel === "metrics" && (
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen">
              <p className="text-zinc-300 italic">Loading...</p>
            </div>
          }
        >
          <Metrics />
        </Suspense>
      )}
      {activePanel === "chat" && (
        <Chat debug={debug} activePanel={activePanel} />
      )}
    </div>
  );
}

export default RightPanel;

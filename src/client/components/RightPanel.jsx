import React, { lazy, Suspense } from "react";
import Container from "./Container";
import Alerts from "./Alerts";
import Alarms from "./Alarms";

const Metrics = lazy(() => import("./Metrics"));
import Chat from "./Chat";

function RightPanel({
  activePanel,
  alertData,
  alarmData,
  containerData,
  debug,
  setDebug,
}) {
  return (
    <div className="w-3/4 p-4 bg-gray-500">
      {activePanel === "containers" && (
        <Container containerData={containerData} setDebug={setDebug} />
      )}
      {activePanel === "alerts" && <Alerts alertData={alertData} />}
      {activePanel === "alarms" && <Alarms alarmData={alarmData} />}
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
      {activePanel === "chat" && <Chat debug={debug} />}
    </div>
  );
}

export default RightPanel;

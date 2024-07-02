function createAlert(
  severity = "Info",
  host = "Windows Server",
  service,
  details,
  isAlarm = false,
  status = "active"
) {
  return {
    severity,
    host,
    service,
    details,
    isAlarm,
    status,
  };
}

// Example usage
const alert1 = createAlert(
  "Warning",
  "Linux Server",
  "Database Down",
  "Connection lost",
  true,
  "resolved"
);

const alert2 = createAlert(
  undefined,
  undefined,
  "Network Issue",
  "Packet loss detected"
);

const some = new Set(["api", "b", "c"]);

const event = {
  service: "/api",
  details: "Service is down",
};

let unit = event.service[0] === "/" ? event.service.slice(1) : "";

if (!some.has(unit)) {
  console.log("Service not found");
}

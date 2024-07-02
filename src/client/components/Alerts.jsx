import React from "react";

// const alertData = [
//   {
//     id: 1,
//     name: "High CPU Usage",
//     severity: "Critical",
//     service: "redis",
//     description: "CPU usage has exceeded 90%.",
//   },
//   {
//     id: 2,
//     name: "Memory Leak",
//     severity: "Warning",
//     service: "redis",
//     description: "Memory consumption is increasing steadily.",
//   },
//   {
//     id: 3,
//     name: "Disk Space Low",
//     severity: "Critical",
//     service: "redis",
//     description: "Less than 10% disk space remaining.",
//   },
//   {
//     id: 4,
//     name: "Network Latency",
//     severity: "Info",
//     service: "redis",
//     description: "Network latency is higher than usual.",
//   },
// ];

const css_table_border_right = "py-2 px-4 border-r border-gray-700";

function Alerts({ alertData }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white";
      case "Warning":
        return "bg-yellow-500 text-white";
      case "Info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-4">Active Alerts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className={css_table_border_right}>Service</th>
              <th className={css_table_border_right}>Host</th>
              <th className={css_table_border_right}>Severity</th>
              <th className={css_table_border_right}>Status</th>
              <th className={css_table_border_right}>Details</th>
            </tr>
          </thead>
          {alertData.length === 0 && (
            <div className="flex justify-center items-center">
              <p className="text-zinc-300 italic">No Alerts to display</p>
            </div>
          )}
          <tbody>
            {alertData.map((alert) => (
              <tr key={alert.id} className="border-b border-gray-700">
                <td className="py-2 px-4 border-r border-gray-700">
                  {alert.service}
                </td>
                <td className="py-2 px-4 border-r border-gray-700">
                  {alert.host}
                </td>
                <td
                  className={`py-2 px-4 ${getSeverityColor(
                    alert.severity
                  )} border-r border-gray-700`}
                >
                  {alert.severity}
                </td>
                <td className="py-2 px-4 border-r border-gray-700">
                  {alert.status}
                </td>
                <td className="py-2 px-4">{alert.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Alerts;

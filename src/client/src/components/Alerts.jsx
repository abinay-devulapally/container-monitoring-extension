import React from "react";

const css_table_border_right = "py-2 px-4 border-r border-gray-700";

function Alerts({ error, alertData }) {
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-900 italic">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-4">Active Alerts</h1>
      {alertData.length === 0 ? (
        <div className="flex justify-center items-center">
          <p className="text-zinc-300 italic">No Alerts to display</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default Alerts;

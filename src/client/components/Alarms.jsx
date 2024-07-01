import React from "react";

const css_table_border_right = "py-2 px-4 border-r border-gray-700";

function Alarms({ alarmData }) {
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
      <h1 className="text-white text-3xl font-bold mb-4">Active Alarms </h1>
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
          {alarmData.length === 0 && (
            <div className="flex justify-center items-center">
              <p className="text-zinc-300 italic">No Alarms to display</p>
            </div>
          )}
          <tbody>
            {alarmData.map((alarm) => (
              <tr key={alarm.id} className="border-b border-gray-700">
                <td className="py-2 px-4 border-r border-gray-700">
                  {alarm.service}
                </td>
                <td className="py-2 px-4 border-r border-gray-700">
                  {alarm.host}
                </td>
                <td
                  className={`py-2 px-4 ${getSeverityColor(
                    alarm.severity
                  )} border-r border-gray-700`}
                >
                  {alarm.severity}
                </td>
                <td className="py-2 px-4 border-r border-gray-700">
                  {alarm.status}
                </td>
                <td className="py-2 px-4">{alarm.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Alarms;

import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const containerOptions = ["redis", "mongoDB"];

const containerData = {
  redis: {
    cpu: [
      65, 59, 80, 81, 56, 55, 45, 50, 60, 70, 80, 90, 85, 75, 65, 60, 55, 50,
      45, 40, 35, 30, 25, 20, 15, 10, 5, 0, 2, 3,
    ],
    memory: [
      45, 49, 60, 71, 46, 35, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50,
    ],
  },
  mongoDB: {
    cpu: [
      45, 79, 60, 71, 66, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25,
      20, 15, 10, 5, 0, 2, 3, 4, 5, 6, 7, 8,
    ],
    memory: [
      25, 39, 40, 51, 56, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, 2, 3, 4, 5, 6,
      7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ],
  },
};

const getLast30MinutesLabels = () => {
  const labels = [];
  const now = new Date();
  for (let i = 30; i >= 1; i--) {
    const minutesAgo = new Date(now.getTime() - i * 60000);
    labels.push(
      `${minutesAgo.getHours()}:${minutesAgo
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );
  }
  return labels;
};

function Metrics() {
  const [selectedContainer, setSelectedContainer] = useState("redis");
  const cpuChartRef = useRef(null);
  const memoryChartRef = useRef(null);
  const cpuChartInstance = useRef(null);
  const memoryChartInstance = useRef(null);

  useEffect(() => {
    const cpuCtx = cpuChartRef.current.getContext("2d");
    const memoryCtx = memoryChartRef.current.getContext("2d");

    const labels = getLast30MinutesLabels();

    if (cpuChartInstance.current) {
      cpuChartInstance.current.destroy();
    }
    if (memoryChartInstance.current) {
      memoryChartInstance.current.destroy();
    }

    cpuChartInstance.current = new Chart(cpuCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "CPU Usage",
            data: containerData[selectedContainer].cpu,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: { color: "white" },
          },
          y: {
            ticks: { color: "white" },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },
      },
    });

    memoryChartInstance.current = new Chart(memoryCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Memory Usage",
            data: containerData[selectedContainer].memory,
            borderColor: "rgb(153, 102, 255)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: { color: "white" },
          },
          y: {
            ticks: { color: "white" },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },
      },
    });

    return () => {
      if (cpuChartInstance.current) {
        cpuChartInstance.current.destroy();
      }
      if (memoryChartInstance.current) {
        memoryChartInstance.current.destroy();
      }
    };
  }, [selectedContainer]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Metrics Panel</h1>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Select Container
        </label>
        <select
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          {containerOptions.map((container, index) => (
            <option key={index} value={container}>
              {container}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">CPU Usage</h2>
          <canvas
            ref={cpuChartRef}
            width="400"
            height="200"
            className="bg-black"
          ></canvas>
        </div>
        <div className="bg-gray-800 shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">
            Memory Usage
          </h2>
          <canvas
            ref={memoryChartRef}
            width="400"
            height="200"
            className="bg-black"
          ></canvas>
        </div>
      </div>
    </div>
  );
}

export default Metrics;

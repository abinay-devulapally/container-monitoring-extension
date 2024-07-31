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

function processData(metrics) {
  // Assuming metrics is the result array from Prometheus
  return metrics.map(metric => ({
    container: metric.metric.container || 'Unknown',
    values: metric.values.map(([timestamp, value]) => ({
      timestamp: convertTimestamp(timestamp),
      value: parseFloat(value),
    })),
  }));
}

// Function to convert Unix timestamp (seconds since epoch) to desired format
function convertTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}


async function fetchCPUMetrics() {
  const query = `sum(rate(container_cpu_usage_seconds_total[1m])) by (container)`;
  const start = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes ago
  const end = new Date().toISOString(); // current time
  const step = '30s';

  const url = `http://localhost:9090/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const processedData = processData(data.data.result);
    return processedData[0]["values"];
  } catch (error) {
    console.error('Error fetching CPU metrics:', error);
    return [];
  }
}

async function fetchMemoryMetrics() {
  const query = `sum(container_memory_usage_bytes) by (container)`;
  const start = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes ago
  const end = new Date().toISOString(); // current time
  const step = '30s';

  const url = `http://localhost:9090/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`;

  console.log(url)

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const processedData = processData(data.data.result);
    return processedData[0]["values"];
  } catch (error) {
    console.error('Error fetching Memory metrics:', error);
    return [];
  }
}

function Metrics() {
  const [selectedContainer, setSelectedContainer] = useState("redis");
  const [cpuvalues, setcpuvalues] = useState([])
  const [memoryvalues, setmemoryvalues] = useState([])
  const [labelvalues, setlabelvalues] = useState([])
  const cpuChartRef = useRef(null);
  const memoryChartRef = useRef(null);
  const cpuChartInstance = useRef(null);
  const memoryChartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const cpuMetrics = await fetchCPUMetrics();
      const memoryMetrics = await fetchMemoryMetrics()
      const cpuValues = cpuMetrics.map((cpuValues) => cpuValues.value);
      const labelValues = cpuMetrics.map((cpuValues) => cpuValues.timestamp);
      const memoryValues = memoryMetrics.map((memoryValues) =>  (memoryValues.value / (1024 * 1024 * 1024)).toFixed(2))
      setcpuvalues(cpuValues);
      setmemoryvalues(memoryValues)
      setlabelvalues(labelValues) // Do something with the CPU values
    };
    fetchData();
  }, []);

  useEffect(() => {
    const cpuCtx = cpuChartRef.current.getContext("2d");
    const memoryCtx = memoryChartRef.current.getContext("2d");


    const labels = labelvalues;

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
            data: cpuvalues,
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
            data: memoryvalues,
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

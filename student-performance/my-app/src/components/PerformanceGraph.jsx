import { useEffect, useState } from "react";
import axios from "../services/Api";
import { Line } from "react-chartjs-2";

export default function PerformanceGraph() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    async function fetchPerformance() {
      const res = await axios.get("/performance");
      setChartData({
        labels: res.data.labels,
        datasets: [{
          label: "Student Performance",
          data: res.data.values,
          borderColor: "#3b82f6",
          fill: false
        }]
      });
    }
    fetchPerformance();
  }, []);

  return <Line data={chartData} />;
}
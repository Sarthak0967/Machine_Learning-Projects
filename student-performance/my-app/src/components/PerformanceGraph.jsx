import { useEffect, useState } from "react";
import axios from "../services/API";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceGraph() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: "Student Performance",
      data: [],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      fill: false
    }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const res = await axios.get("/performance", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setChartData({
          labels: res.data.map(item => item.label || item.date),
          datasets: [{
            label: "Student Performance",
            data: res.data.map(item => item.value || item.score),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            fill: false,
            tension: 0.1
          }]
        });
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading performance data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <Line 
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Student Performance Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Score'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }}
      />
    </div>
  );
}
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const stats = [
    { title: "Total Users", value: "12,430", growth: "+12%" },
    { title: "Active Sessions", value: "895", growth: "+3.4%" },
    { title: "Revenue", value: "₹5.2L", growth: "+9.2%" },
    { title: "Bounce Rate", value: "22%", growth: "-1.8%" },
  ];

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Visitors",
        data: [500,700,750,850,720,1050,2050],
        fill: true,
        borderColor: "#9333ea",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        tension: 0.4,
         borderWidth: 1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 500 },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="lg:text-3xl text-xl font-bold mb-8 text-gray-800 mt-16">📊 Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow hover:shadow-md transition border-l-4 border-purple-600"
          >
            <h3 className="text-sm text-gray-500">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            <p
              className={`text-sm mt-1 ${
                stat.growth.startsWith("-") ? "text-red-500" : "text-green-500"
              }`}
            >
              {stat.growth} from last week
            </p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Weekly Visitors</h2>
          <span className="text-sm text-gray-400">Last 7 days</span>
        </div>
        <Line data={chartData} options={chartOptions} height={100} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

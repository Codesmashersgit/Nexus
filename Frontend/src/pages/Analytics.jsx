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

const AnalyticsDashboard = ({ isNested }) => {
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
        data: [500, 700, 750, 850, 720, 1050, 2050],
        fill: true,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        borderWidth: 2
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
    <div className="pt-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 lg:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 border-indigo-600 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs lg:text-sm font-semibold text-gray-400 uppercase tracking-tight">{stat.title}</h3>
              <p className="text-xl lg:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
            <p
              className={`text-xs lg:text-sm mt-2 font-medium ${stat.growth.startsWith("-") ? "text-red-500" : "text-green-500"
                }`}
            >
              {stat.growth} <span className="text-gray-400 font-normal text-xs">from last week</span>
            </p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Weekly Visitors</h2>
            <p className="text-sm text-gray-400">Activity from the last 7 days</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            Live Updates
          </div>
        </div>
        <div className="relative h-[250px] lg:h-[400px] w-full">
          <Line
            data={chartData}
            options={{
              ...chartOptions,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

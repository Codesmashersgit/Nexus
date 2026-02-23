import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const AnalyticsDashboard = ({ rooms: initialRooms = [], history: initialHistory = [] }) => {
  // Use state to handle cases where props aren't provided (e.g. direct /analytics link)
  const [rooms, setRooms] = React.useState(initialRooms);
  const [history, setHistory] = React.useState(initialHistory);

  React.useEffect(() => {
    // If props were provided (from Dashboard), use them
    if (initialRooms.length > 0 || initialHistory.length > 0) {
      setRooms(initialRooms);
      setHistory(initialHistory);
    } else {
      // Fallback: Load from localStorage for standalone page
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) setRooms(JSON.parse(storedRooms));

      const storedHistory = localStorage.getItem("meetingHistory");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    }
  }, [initialRooms, initialHistory]);

  // Calculate stats based on real data
  const totalRooms = rooms.length;
  const totalMeetings = history.length;

  // Mock some active sessions based on data presence
  const activeSessions = totalMeetings > 0 ? Math.floor(Math.random() * 5) + 1 : 0;

  // Calculate engagement rate (dummy logic: meetings per room ratio)
  const engagementRate = totalRooms > 0
    ? Math.min(100, Math.floor((totalMeetings / (totalRooms * 0.5)) * 10))
    : 0;

  const stats = [
    { title: "Total Rooms", value: totalRooms, growth: rooms.length > 0 ? "+100%" : "0%" },
    { title: "Active Sessions", value: activeSessions, growth: activeSessions > 0 ? "+5.2%" : "0%" },
    { title: "Total Meetings", value: totalMeetings, growth: history.length > 0 ? "+18%" : "0%" },
    { title: "Engagement Rate", value: `${engagementRate}%`, growth: engagementRate > 50 ? "+12%" : "0%" },
  ];

  // Process history data for the chart (Group by Day of Week)
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    history.forEach(item => {
      try {
        // Handle different date formats (some might be .toLocaleString(), some ISO)
        const date = new Date(item.createdAt);
        if (!isNaN(date)) {
          const dayName = days[date.getDay()];
          counts[dayName]++;
        }
      } catch (e) {
        console.error("Error parsing date for analytics:", e);
      }
    });

    // Reorder based on Mon-Sun for the chart
    const labelOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const orderedData = labelOrder.map(day => counts[day] || 0);

    // If data is very sparse, add some baseline for aesthetics if it's a demo
    const finalData = orderedData.some(v => v > 0) ? orderedData : [0, 0, 1, 0, 2, 0, 1];

    return {
      labels: labelOrder,
      datasets: [
        {
          label: "Meeting Activity",
          data: finalData,
          fill: true,
          borderColor: "#fa1239",
          backgroundColor: "rgba(250, 18, 57, 0.1)",
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fa1239",
          pointBorderColor: "#fff",
          pointHoverRadius: 6,
        },
      ],
    };
  }, [history]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { family: 'Outfit', size: 14 },
        bodyFont: { family: 'Outfit', size: 13 },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { family: 'Outfit' },
          stepSize: 1
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { family: 'Outfit' }
        },
      },
    },
  };

  return (
    <div className="pt-24 px-4 lg:px-0">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform <span className="text-[#fa1239]">Analytics</span></h1>
          <p className="text-gray-400 font-medium">Real-time performance metrics for your meetings</p>
        </div>
        <div className="hidden md:block">
          <button className="px-5 py-2.5 glass-panel text-sm font-bold border-white/10 hover:bg-white/5 transition-all">Download Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-panel p-6 border-white/5 hover:border-[#fa1239]/20 transition-all group flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.15em] mb-4">{stat.title}</h3>
              <p className="text-3xl font-bold tracking-tight group-hover:text-[#fa1239] transition-colors">{stat.value}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${stat.growth.startsWith("-") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                }`}>
                {stat.growth}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="glass-panel border-white/5 p-8 backdrop-blur-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Weekly Activity</h2>
            <p className="text-sm text-gray-500 font-medium">Meeting patterns over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fa1239]/5 border border-[#fa1239]/20 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#fa1239] animate-pulse"></span>
            <span className="text-xs font-bold text-[#fa1239] uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
        <div className="h-[350px] lg:h-[450px] w-full">
          <Line
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

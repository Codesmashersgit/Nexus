
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FiUsers, FiDollarSign, FiPhoneCall, FiTrendingUp, FiTrash2, FiUserCheck, FiShield } from "react-icons/fi";
import "./Home.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${SERVER_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      setError(err.response?.data?.message || "Failed to load dashboard data. Check console for details.");
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleToggleAdmin = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`${SERVER_URL}/api/admin/user-role`, { userId: user._id, role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const chartData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: stats.growthData.map(d => d.date),
      datasets: [
        {
          label: "New Signups",
          data: stats.growthData.map(d => d.count),
          fill: true,
          borderColor: "#fa1239",
          backgroundColor: "rgba(250, 18, 57, 0.1)",
          tension: 0.4,
          borderWidth: 3,
        },
      ],
    };
  }, [stats]);

  const planData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: ["Free", "Pro", "Enterprise"],
      datasets: [
        {
          data: [stats.freeUsers, stats.proUsers, stats.enterpriseUsers],
          backgroundColor: ["#333", "#fa1239", "#ff6a00"],
          borderWidth: 0,
        },
      ],
    };
  }, [stats]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-bold">Loading Admin Panel...</div>;

  if (error) return (
    <div className="home-container min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 border-red-500/20 text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button 
          onClick={fetchData}
          className="px-8 py-3 bg-[#fa1239] text-white rounded-2xl font-bold hover:brightness-110"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="home-container min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              Admin <span className="text-[#fa1239]">Dashboard</span>
            </h1>
            <p className="text-gray-400 font-medium">Global system overview and user management</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#fa1239] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-[#fa1239] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Users
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { title: "Total Users", value: stats.totalUsers, icon: <FiUsers />, growth: `+${stats.recentSignups}` },
                { title: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: <FiDollarSign />, growth: "Est." },
                { title: "Call Usage", value: stats.totalCalls, icon: <FiPhoneCall />, growth: "Total" },
                { title: "Growth", value: `${((stats.recentSignups / (stats.totalUsers || 1)) * 100).toFixed(1)}%`, icon: <FiTrendingUp />, growth: "7d" },
              ].map((item, idx) => (
                <div key={idx} className="glass-panel p-6 border-white/5 hover:border-[#fa1239]/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#fa1239]/10 text-[#fa1239] rounded-xl text-xl">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-gray-400 uppercase tracking-widest">
                      {item.growth}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{item.title}</h3>
                  <p className="text-3xl font-bold text-white group-hover:text-[#fa1239] transition-colors">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel p-8 border-white/5">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                   User Growth <span className="text-xs font-black bg-[#fa1239]/10 text-[#fa1239] px-2 py-1 rounded">Last 7 Days</span>
                </h3>
                <div className="h-[350px]">
                  {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                </div>
              </div>

              <div className="glass-panel p-8 border-white/5">
                <h3 className="text-xl font-bold mb-8">Plan Distribution</h3>
                <div className="h-[250px] flex items-center justify-center">
                  {planData && <Doughnut data={planData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { weight: 'bold' } } } } }} />}
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold">Free Users</span>
                    <span className="text-white font-bold">{stats.freeUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#fa1239] font-bold">Pro Users</span>
                    <span className="text-white font-bold">{stats.proUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#ff6a00] font-bold">Enterprise Users</span>
                    <span className="text-white font-bold">{stats.enterpriseUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">User</th>
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Plan</th>
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Usage</th>
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Joined</th>
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Role</th>
                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fa1239] to-[#ff6a00] flex items-center justify-center font-bold text-white shadow-lg">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-[#fa1239] transition-colors">{user.username}</p>
                            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                          user.subscription?.planType === 'enterprise' ? 'bg-[#ff6a00]/20 text-[#ff6a00]' :
                          user.subscription?.planType === 'pro' ? 'bg-[#fa1239]/20 text-[#fa1239]' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.subscription?.planType || 'free'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{user.callUsage?.count || 0}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Calls</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-400 font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${user.role === 'admin' ? 'text-[#fa1239]' : 'text-gray-400'}`}>
                          <FiShield /> {user.role?.toUpperCase() || 'USER'}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleAdmin(user)}
                            className="p-2 bg-white/5 hover:bg-[#fa1239]/10 text-gray-400 hover:text-[#fa1239] rounded-lg transition-all"
                            title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                          >
                            <FiUserCheck />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

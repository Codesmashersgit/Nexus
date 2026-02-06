
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import img from "../assets/Group.png";

import { RxDashboard } from "react-icons/rx";
import { RiVideoAddFill, RiMenuFoldFill } from "react-icons/ri";
import { ImUser } from "react-icons/im";
import { IoIosArrowDown, IoIosArrowUp, IoMdCopy } from "react-icons/io";
import { IoHome, IoStatsChart } from "react-icons/io5";
import { TiGroup } from "react-icons/ti";
import { CiLogout } from "react-icons/ci";
import { FaWhatsapp, FaCheckCircle } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { MdEmail, MdDelete, MdHistory } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import AnalyticsDashboard from "../pages/Analytics";

function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [roomList, setRoomList] = useState([]);
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [copySuccess, setCopySuccess] = useState(null);

  const [_isLogged, setIsLogged] = useState(false);
  const [userNameDisplay, setUserNameDisplay] = useState("User");
  const [userEmail, setUserEmail] = useState("email@example.com");

  const [currentDate, setCurrentDate] = useState("");

  const menuRef = useRef();
  const navigate = useNavigate();
  const FRONTEND_URL = window.location.origin;

  // Show current date/time
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
    setCurrentDate(formatted);
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  // Delete room
  const handleDelete = (roomToDeleteId) => {
    const updatedRooms = roomList.filter(r => r.id !== roomToDeleteId);
    setRoomList(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
  };

  // Delete history entry
  const handleDeleteHistory = (idx) => {
    const updatedHistory = meetingHistory.filter((_, i) => i !== idx);
    setMeetingHistory(updatedHistory);
    localStorage.setItem("meetingHistory", JSON.stringify(updatedHistory));
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Create new room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const newRoom = {
      id: uuidv4(),
      name: roomName.trim(),
      createdAt: new Date().toLocaleString(),
    };

    const updatedRooms = [...roomList, newRoom];
    setRoomList(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));

    // Add to history too
    const updatedHistory = [{ ...newRoom, type: 'Created' }, ...meetingHistory];
    setMeetingHistory(updatedHistory);
    localStorage.setItem("meetingHistory", JSON.stringify(updatedHistory));

    setRoomName("");
    setShowCreateRoomForm(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  // Load localStorage data on mount
  useEffect(() => {
    const storedRooms = localStorage.getItem("rooms");
    if (storedRooms) setRoomList(JSON.parse(storedRooms));

    const storedHistory = localStorage.getItem("meetingHistory");
    if (storedHistory) setMeetingHistory(JSON.parse(storedHistory));

    setUserNameDisplay(localStorage.getItem("username") || "Guest User");
    setUserEmail(localStorage.getItem("email") || "email@example.com");

    const token = localStorage.getItem("authToken");
    setIsLogged(!!token);
  }, []);

  const handleMenuClick = (sectionName) => {
    setActiveSection(sectionName);
    if (window.innerWidth < 1024) setIsMenuOpen(false);
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      localStorage.removeItem("email");

      setIsLogged(false);
      alert("You have been logged out successfully!");
      navigate("/");
    }
  };

  // Render page content
  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className="space-y-6 md:y-8">
            <div className="relative overflow-hidden p-6 md:p-10 rounded-2xl md:rounded-3xl text-white shadow-2xl glass-panel border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa1239]/10 blur-[100px] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">Welcome back, <span className="text-[#fa1239]">{userNameDisplay}</span>!</h2>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl font-medium">Manage your professional meetings and explore detailed analytics from your premium command center.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="glass-panel p-6 md:p-8 flex items-center gap-4 md:gap-6 hover:bg-white/5 transition-all duration-300 group cursor-default">
                <div className="bg-[#fa1239]/10 p-4 md:p-5 rounded-2xl text-[#fa1239] group-hover:scale-110 transition-transform">
                  <RiVideoAddFill className="text-2xl md:text-3xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Total Rooms</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{roomList.length}</p>
                </div>
              </div>

              <div className="glass-panel p-6 md:p-8 flex items-center gap-4 md:gap-6 hover:bg-white/5 transition-all duration-300 group cursor-default">
                <div className="bg-blue-500/10 p-4 md:p-5 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <MdHistory className="text-2xl md:text-3xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">History Entries</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{meetingHistory.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 md:p-10">
              <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 text-white flex items-center gap-3">
                <div className="w-1 md:w-1.5 h-6 md:h-8 bg-[#fa1239] rounded-full"></div>
                Quick Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <button
                  onClick={() => handleMenuClick("Room")}
                  className="bg-[#fa1239] hover:brightness-110 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto shadow-lg shadow-[#fa1239]/20 text-sm md:text-base"
                >
                  <RiVideoAddFill className="text-lg md:text-xl" /> Create / Join Room
                </button>
                <button
                  onClick={() => handleMenuClick("Analytics")}
                  className="glass-panel hover:bg-white/10 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto border-white/10 text-sm md:text-base"
                >
                  <IoStatsChart className="text-lg md:text-xl" /> View Analytics
                </button>
              </div>
            </div>
          </div>
        );

      case "Room":
        return (
          <div className="glass-panel border-white/10 p-5 md:p-12 space-y-8 md:space-y-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">My Meeting Rooms</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">Create and manage your private meeting spaces.</p>
              </div>
              <button
                onClick={() => setShowCreateRoomForm(true)}
                className="bg-[#fa1239] hover:brightness-110 text-white px-6 py-3.5 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#fa1239]/20 w-full lg:w-auto text-sm md:text-base"
              >
                <RiVideoAddFill className="text-xl" /> New Room
              </button>
            </div>

            {roomList.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                <RiVideoAddFill className="text-5xl text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">You haven't created any rooms yet.</p>
                <button
                  onClick={() => setShowCreateRoomForm(true)}
                  className="mt-6 text-[#fa1239] font-bold hover:underline"
                >
                  Create your first room →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {roomList.map((room) => {
                  const roomURL = `${FRONTEND_URL}/room/${room.id}`;
                  const shareText = `Join my meeting on Nexus: ${roomURL}`;
                  const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

                  return (
                    <div key={room.id} className="group glass-panel hover:bg-white/5 border-white/5 hover:border-[#fa1239]/30 p-6 md:p-8 transition-all duration-500">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <h3 className="text-2xl font-bold text-white group-hover:text-[#fa1239] transition-colors tracking-tight">{room.name}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-2 font-medium">
                            <CiCalendarDate className="text-[#fa1239]" /> Created on {room.createdAt}
                          </p>
                          <div className="mt-4 flex items-center gap-3 bg-black/40 px-4 py-3 rounded-xl border border-white/5 w-fit">
                            <code className="text-xs text-gray-400 font-mono truncate max-w-[150px] md:max-w-md">{roomURL}</code>
                            <button
                              onClick={() => copyToClipboard(roomURL, room.id)}
                              className="text-[#fa1239] hover:scale-110 transition-transform p-1"
                              title="Copy Link"
                            >
                              {copySuccess === room.id ? <FaCheckCircle className="text-green-500" /> : <IoMdCopy className="text-xl" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate(`/room/${room.id}`)}
                            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm shadow-xl"
                          >
                            Join Room
                          </button>
                          <a
                            href={whatsappURL}
                            target="_blank"
                            className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                            title="Share on WhatsApp"
                          >
                            <FaWhatsapp className="text-xl" />
                          </a>
                          <button
                            onClick={() => { if (window.confirm('Delete this room?')) handleDelete(room.id) }}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="Delete Room"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "Meeting History":
        return (
          <div className="glass-panel border-white/10 p-8 md:p-12">
            <h2 className="text-3xl font-extrabold text-white mb-10 flex items-center gap-4">
              <MdHistory className="text-[#fa1239]" /> <span className="gradient-text">Meeting History</span>
            </h2>
            {meetingHistory.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                <p className="text-gray-500 font-bold">No meeting history found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
                      <th className="pb-4 px-6">Room Name</th>
                      <th className="pb-4 px-6">Date & Time</th>
                      <th className="pb-4 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {meetingHistory.map((item, idx) => (
                      <tr key={idx} className="group glass-panel hover:bg-white/5 transition-all duration-300 border-none">
                        <td className="py-6 px-6 font-bold text-white group-hover:text-[#fa1239] transition-colors rounded-l-2xl border-y border-l border-white/5">{item.name}</td>
                        <td className="py-6 px-6 text-gray-400 font-medium border-y border-white/5">{item.createdAt}</td>
                        <td className="py-6 px-6 font-medium border-y border-white/5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.type === 'Created' ? 'bg-[#fa1239]/10 text-[#fa1239]' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                            {item.type || 'Joined'}
                          </span>
                        </td>
                        <td className="py-6 px-6 rounded-r-2xl border-y border-r border-white/5">
                          <button
                            onClick={() => handleDeleteHistory(idx)}
                            className="p-2 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                            title="Delete Entry"
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "Analytics":
        return <AnalyticsDashboard />;

      case "Profile":
        return (
          <div className="max-w-2xl mx-auto glass-panel border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="bg-gradient-to-r from-[#fa1239]/20 to-[#fa1239]/5 h-40 relative">
              <div className="absolute -bottom-16 left-12">
                <div className="bg-[#050505] p-2 rounded-full shadow-2xl">
                  <div className="bg-[#fa1239]/10 text-[#fa1239] w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black border-4 border-white/5 shadow-inner">
                    {userNameDisplay.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-24 pb-12 px-12 space-y-8">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tight">{userNameDisplay}</h2>
                <p className="text-gray-500 font-bold tracking-wide mt-1">{userEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Account Created</p>
                  <p className="text-gray-300 font-bold">{currentDate.split(',')[0]}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Account Status</p>
                  <p className="text-[#fa1239] font-black flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#fa1239] rounded-full animate-pulse"></span>
                    Premium Active
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 text-red-500 font-black py-5 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 border border-red-500/20"
                >
                  <CiLogout className="text-2xl" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Sidebar Menu Items
  const MenuItems = (
    <div className="flex flex-col h-full pt-20 pb-8">
      <div className="flex-1 space-y-3 px-4">
        <div
          onClick={() => handleMenuClick("Dashboard")}
          className={`flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all duration-300 group ${activeSection === "Dashboard"
            ? "bg-[#fa1239] text-white shadow-lg shadow-[#fa1239]/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <RxDashboard className={`text-xl ${activeSection === "Dashboard" ? "text-white" : "group-hover:text-[#fa1239]"}`} />
          <span className="font-bold tracking-tight">Dashboard</span>
        </div>

        <div className="py-2">
          <div
            className={`flex items-center justify-between px-5 py-4 cursor-pointer rounded-2xl transition-all duration-300 ${activeSection === "Room" || activeSection === "Meeting History"
              ? "bg-white/5 text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            onClick={toggleDropdown}
          >
            <div className="flex items-center gap-4">
              <RiVideoAddFill className={`text-xl ${activeSection === "Room" || activeSection === "Meeting History" ? "text-[#fa1239]" : ""}`} />
              <span className="font-bold tracking-tight">Video Conference</span>
            </div>
            {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>

          {isDropdownOpen && (
            <div className="mt-3 ml-6 space-y-2 border-l-2 border-[#fa1239]/20 pl-4">
              <div
                onClick={() => handleMenuClick("Room")}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${activeSection === "Room" ? "text-[#fa1239] bg-[#fa1239]/10 font-bold" : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
              >
                <IoHome className="text-lg" /> <span className="text-sm">My Rooms</span>
              </div>

              <div
                onClick={() => handleMenuClick("Meeting History")}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${activeSection === "Meeting History" ? "text-[#fa1239] bg-[#fa1239]/10 font-bold" : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
              >
                <MdHistory className="text-xl" /> <span className="text-sm">History</span>
              </div>
            </div>
          )}
        </div>

        <div
          onClick={() => handleMenuClick("Analytics")}
          className={`flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all duration-300 group ${activeSection === "Analytics"
            ? "bg-[#fa1239] text-white shadow-lg shadow-[#fa1239]/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <IoStatsChart className={`text-xl ${activeSection === "Analytics" ? "text-white" : "group-hover:text-[#fa1239]"}`} />
          <span className="font-bold tracking-tight">Analytics</span>
        </div>

        <div
          onClick={() => handleMenuClick("Profile")}
          className={`flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all duration-300 group ${activeSection === "Profile"
            ? "bg-[#fa1239] text-white shadow-lg shadow-[#fa1239]/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <ImUser className={`text-xl ${activeSection === "Profile" ? "text-white" : "group-hover:text-[#fa1239]"}`} />
          <span className="font-bold tracking-tight">My Profile</span>
        </div>
      </div>

      <div className="px-6 pt-10 mt-auto border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-5 py-4 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all duration-300 font-bold tracking-tight"
        >
          <CiLogout className="text-xl" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] text-white flex overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 glass-panel border-r border-white/5 z-30 fixed top-16 bottom-0 left-0 overflow-y-auto custom-scrollbar m-4 rounded-3xl">
        {MenuItems}
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 h-screen overflow-y-auto pt-16 scroll-smooth relative z-10">
        {/* Removed redundant mobile header as global Navbar is used */}

        {/* Mobile menu trigger (Floating button since header is gone) */}
        {!isMenuOpen && (
          <button
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#fa1239] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
            onClick={toggleMenu}
          >
            <RiMenuFoldFill size={24} />
          </button>
        )}

        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleMenu}></div>
            <div
              ref={menuRef}
              className="fixed top-0 left-0 bottom-0 glass-panel border-r border-white/10 shadow-2xl w-72 animate-in slide-in-from-left duration-300 m-0 rounded-none"
            >
              {MenuItems}
            </div>
          </div>
        )}

        {/* Dynamic Content Area */}
        <main className="flex-1 px-4 md:px-6 lg:px-10 pt-4 md:pt-16 pb-16 max-w-7xl mx-auto w-full">
          <div className="mb-6 hidden lg:flex justify-between items-center h-20 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                {activeSection === "Dashboard" && <RxDashboard className="text-[#fa1239]" />}
                {activeSection === "Analytics" && <IoStatsChart className="text-[#fa1239]" />}
                {activeSection === "Profile" && <ImUser className="text-[#fa1239]" />}
                {activeSection === "Room" && <RiVideoAddFill className="text-[#fa1239]" />}
                {activeSection === "Meeting History" && <MdHistory className="text-[#fa1239]" />}
                <span className="gradient-text">{activeSection}</span>
              </h2>
              <p className="text-gray-400 text-xs mt-1 font-medium tracking-wide">Today is {currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-white tracking-tight">{userNameDisplay}</p>
                <p className="text-[10px] text-[#fa1239] font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-[#fa1239] rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
              <div className="w-12 h-12 glass-panel flex items-center justify-center text-[#fa1239] font-bold border-white/10 shadow-xl hover:scale-110 transition-transform cursor-pointer text-xl">
                {userNameDisplay.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>

        <footer className="py-8 px-10 text-center text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase opacity-50">
          © {new Date().getFullYear()} Nexus. Premium Virtual Meetings.
        </footer>
      </div>

      {showCreateRoomForm && (
        <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <div className="glass-panel border-white/10 p-6 md:p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fa1239]/10 blur-[60px] pointer-events-none"></div>

            <button
              onClick={() => setShowCreateRoomForm(false)}
              className="absolute top-4 md:top-6 right-4 md:right-6 text-gray-500 hover:text-white transition-colors"
            >
              <IoCloseSharp size={24} />
            </button>

            <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-white tracking-tight">Create <span className="text-[#fa1239]">Room</span></h3>
            <form onSubmit={handleCreateRoom} className="space-y-4 md:space-y-6">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest px-1">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Sync"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 focus:border-[#fa1239] focus:ring-1 focus:ring-[#fa1239] outline-none px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all text-white placeholder:text-gray-600 font-bold text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col gap-3 pt-2 md:pt-4">
                <button type="submit" className="w-full bg-[#fa1239] text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-[#fa1239]/20 text-sm md:text-base">
                  Generate Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRoomForm(false)}
                  className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all text-sm md:text-base"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

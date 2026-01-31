
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
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {userNameDisplay}!</h2>
              <p className="opacity-90">Manage your meetings and analytics from your personalized dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
                  <RiVideoAddFill className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-800">{roomList.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="bg-green-100 p-4 rounded-xl text-green-600">
                  <MdHistory className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">History Entries</p>
                  <p className="text-2xl font-bold text-gray-800">{meetingHistory.length}</p>
                </div>
              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => handleMenuClick("Room")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <RiVideoAddFill /> Create / Join Room
                </button>
                <button
                  onClick={() => handleMenuClick("Analytics")}
                  className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <IoStatsChart /> View Analytics
                </button>
              </div>
            </div>
          </div>
        );

      case "Room":
        return (
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Meeting Rooms</h2>
              <button
                onClick={() => setShowCreateRoomForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <RiVideoAddFill /> New Room
              </button>
            </div>

            {roomList.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">You haven't created any rooms yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {roomList.map((room) => {
                  const roomURL = `${FRONTEND_URL}/room/${room.id}`;
                  const shareText = `Join my meeting on Nexus: ${roomURL}`;
                  const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

                  return (
                    <div key={room.id} className="group bg-gray-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 p-5 rounded-2xl transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <CiCalendarDate /> Created on {room.createdAt}
                          </p>
                          <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 w-fit">
                            <code className="text-xs text-indigo-600 font-mono truncate max-w-[200px] md:max-w-md">{roomURL}</code>
                            <button
                              onClick={() => copyToClipboard(roomURL, room.id)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Copy Link"
                            >
                              {copySuccess === room.id ? <FaCheckCircle className="text-green-500" /> : <IoMdCopy />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/room/${room.id}`)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                          >
                            Join Room
                          </button>
                          <a
                            href={whatsappURL}
                            target="_blank"
                            className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <FaWhatsapp className="text-lg" />
                          </a>
                          <button
                            onClick={() => { if (window.confirm('Delete this room?')) handleDelete(room.id) }}
                            className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Room"
                          >
                            <MdDelete className="text-lg" />
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
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdHistory className="text-blue-600" /> Meeting History
            </h2>
            {meetingHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No meeting history found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600 px-4">Room Name</th>
                      <th className="pb-4 font-bold text-gray-600 px-4">Date & Time</th>
                      <th className="pb-4 font-bold text-gray-600 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {meetingHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
                        <td className="py-4 px-4 text-gray-500 text-sm">{item.createdAt}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.type === 'Created' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {item.type || 'Joined'}
                          </span>
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
          <div className="max-w-2xl mx-auto bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
            <div className="bg-indigo-600 h-32 relative">
              <div className="absolute -bottom-12 left-10">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <div className="bg-indigo-100 text-indigo-600 w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white">
                    {userNameDisplay.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-16 pb-10 px-10 space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800">{userNameDisplay}</h2>
                <p className="text-gray-500 font-medium">{userEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Created</p>
                  <p className="text-gray-700 font-semibold">{currentDate.split(',')[0]}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-green-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active Now
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <CiLogout className="text-xl" /> Sign Out
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

      <div className="flex-1 space-y-2 px-3">
        <div
          onClick={() => handleMenuClick("Dashboard")}
          className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 group ${activeSection === "Dashboard" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            }`}
        >
          <RxDashboard className="text-xl" />
          <span className="font-semibold">Dashboard</span>
        </div>

        <div className="py-2">
          <div
            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 ${activeSection === "Room" || activeSection === "Meeting History" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
              }`}
            onClick={toggleDropdown}
          >
            <div className="flex items-center gap-4">
              <RiVideoAddFill className="text-xl" />
              <span className="font-semibold">Video Conference</span>
            </div>
            {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>

          {isDropdownOpen && (
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-indigo-100 pl-4">
              <div
                onClick={() => handleMenuClick("Room")}
                className={`flex items-center gap-4 px-4 py-2.5 cursor-pointer rounded-xl transition-all ${activeSection === "Room" ? "text-indigo-600 font-bold" : "text-gray-400 hover:text-indigo-600"
                  }`}
              >
                <IoHome /> <span>My Rooms</span>
              </div>

              <div
                onClick={() => handleMenuClick("Meeting History")}
                className={`flex items-center gap-4 px-4 py-2.5 cursor-pointer rounded-xl transition-all ${activeSection === "Meeting History" ? "text-indigo-600 font-bold" : "text-gray-400 hover:text-indigo-600"
                  }`}
              >
                <MdHistory className="text-xl" /> <span>History</span>
              </div>
            </div>
          )}
        </div>

        <div
          onClick={() => handleMenuClick("Analytics")}
          className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 group ${activeSection === "Analytics" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            }`}
        >
          <IoStatsChart className="text-xl" />
          <span className="font-semibold">Analytics</span>
        </div>

        <div
          onClick={() => handleMenuClick("Profile")}
          className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 group ${activeSection === "Profile" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            }`}
        >
          <ImUser className="text-xl" />
          <span className="font-semibold">My Profile</span>
        </div>
      </div>

      <div className="px-6 pt-10 mt-auto border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-semibold"
        >
          <CiLogout className="text-xl" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 bg-white border-r border-gray-100 z-30 fixed top-16 bottom-0 left-0 overflow-y-auto custom-scrollbar">
        {MenuItems}
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 h-screen overflow-y-auto pt-16 scroll-smooth">
        {/* Removed redundant mobile header as global Navbar is used */}

        {/* Mobile menu trigger (Floating button since header is gone) */}
        {!isMenuOpen && (
          <button
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl"
            onClick={toggleMenu}
          >
            <RiMenuFoldFill size={24} />
          </button>
        )}

        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm" onClick={toggleMenu}></div>
            <div
              ref={menuRef}
              className="fixed top-0 left-0 bottom-0 bg-white shadow-2xl w-72 animate-in slide-in-from-left duration-300"
            >
              {MenuItems}
            </div>
          </div>
        )}

        {/* Dynamic Content Area */}
        <main className="flex-1 px-4 md:px-6 lg:px-10 pt-4 md:pt-16 pb-16 max-w-7xl mx-auto w-full">
          <div className="mb-6 hidden lg:flex justify-between items-center h-16 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {activeSection === "Dashboard" && <RxDashboard className="text-indigo-600" />}
                {activeSection === "Analytics" && <IoStatsChart className="text-indigo-600" />}
                {activeSection === "Profile" && <ImUser className="text-indigo-600" />}
                {activeSection === "Room" && <RiVideoAddFill className="text-indigo-600" />}
                {activeSection === "Meeting History" && <MdHistory className="text-indigo-600" />}
                {activeSection}
              </h2>
              <p className="text-gray-400 text-xs mt-1">Today is {currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{userNameDisplay}</p>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer">
                {userNameDisplay.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>

        <footer className="py-6 px-10 text-center text-gray-400 text-xs mt-auto">
          © {new Date().getFullYear()} Nexus. Premium Virtual Meetings.
        </footer>
      </div>

      {showCreateRoomForm && (
        <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 px-1">Room Name</label>
                <input
                  type="text"
                  placeholder="Enter a descriptive room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  autoFocus
                  className="w-full border-2 border-gray-100 focus:border-indigo-500 outline-none px-4 py-3 rounded-2xl transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition-colors">
                  Create Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRoomForm(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
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


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import img from "../assets/Group.png";

import { RxDashboard } from "react-icons/rx";
import { RiVideoAddFill, RiMenuFoldFill } from "react-icons/ri";
import { ImUser } from "react-icons/im";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { TiGroup } from "react-icons/ti";
import { CiLogout } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { MdEmail, MdDelete } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";

function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [roomList, setRoomList] = useState([]);

  const [_isLogged, setIsLogged] = useState(false);
  const [userNameDisplay, setUserNameDisplay] = useState("User");
  const [userEmail, setUserEmail] = useState("email@example.com");

  const [currentDate, setCurrentDate] = useState("");

  const menuRef = useRef();
  const navigate = useNavigate();
  const FRONTEND_URL = "http://localhost:5173";

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
  const handleDelete = (roomToDelete) =>
    setRoomList(prev => prev.filter(r => r.name !== roomToDelete));

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

    setRoomList(prev => [...prev, newRoom]);
    setRoomName("");
    setShowCreateRoomForm(false);
  };

  // Load localStorage data on mount
  useEffect(() => {
    const storedRooms = localStorage.getItem("rooms");
    if (storedRooms) setRoomList(JSON.parse(storedRooms));

    setUserNameDisplay(localStorage.getItem("username") || "Guest User");
    setUserEmail(localStorage.getItem("email") || "email@example.com");

    const token = localStorage.getItem("authToken");
    setIsLogged(!!token);
  }, []);

  // Save rooms to localStorage
  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(roomList));
  }, [roomList]);

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
          <div className="shadow-lg p-6 rounded-md bg-slate-200">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <div className="flex flex-wrap gap-10">
              <div className="bg-green-500 text-white px-12 py-6 rounded-lg flex items-center gap-4">
                <RiVideoAddFill className="text-3xl" />
                <div>
                  {roomList.length}
                  <br />
                  <span>Total Rooms</span>
                </div>
              </div>
              <div className="bg-red-500 text-white px-12 py-6 rounded-lg flex items-center gap-4">
                <TiGroup className="text-3xl" />
                <div>
                  0
                  <br />
                  <span>Total Users</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Room":
        return (
          <div className="bg-slate-200 shadow-lg rounded-md p-5 flex flex-col gap-5">
            <p className="text-lg font-semibold">My Rooms</p>

            {roomList.length === 0 ? (
              <p className="text-gray-700">You haven't created any rooms yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-4">
                {roomList.map((room, index) => {
                  const roomURL = `/room/${encodeURIComponent(room.name)}`;
                  const shareText = `Join my video room "${room.name}": ${FRONTEND_URL}${roomURL}`;
                  const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

                  return (
                    <li key={index} className="flex items-center justify-between pr-4">
                      <div>
                        <strong>{room.name}</strong> — Created at:{" "}
                        <em>{room.createdAt}</em>
                        <br />
                        <span
                          className="text-blue-600 underline cursor-pointer"
                          onClick={() => {
                            const storedUsername = localStorage.getItem("username")?.trim();
                            if (storedUsername) navigate(roomURL);
                            else navigate(`/room-access/${encodeURIComponent(room.name)}`);
                          }}
                        >
                          Open Room
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <MdDelete
                          title="Delete Room"
                          className="text-red-600 hover:text-red-800 cursor-pointer text-xl"
                          onClick={() => handleDelete(room.name)}
                        />
                        <a
                          href={whatsappURL}
                          target="_blank"
                          className="text-green-600 text-xl hover:text-green-800"
                        >
                          <FaWhatsapp title="Share on WhatsApp" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {showCreateRoomForm ? (
              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 mt-5">
                <input
                  type="text"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  className="border px-4 py-2 rounded-md"
                />
                <div className="flex gap-3">
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">
                    Save Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoomForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateRoomForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-5"
              >
                Create Room
              </button>
            )}
          </div>
        );

      case "Profile":
        return (
          <div className="shadow-lg p-6 lg:w-1/2 bg-slate-200 rounded-md flex flex-col gap-5 text-center lg:text-start">
            <div className="flex justify-center lg:justify-start">
              <h2 className="text-green-500 bg-white rounded-full px-6 py-4 text-4xl font-bold">
                {userNameDisplay.charAt(0).toUpperCase()}
              </h2>
            </div>

            <p className="flex items-center gap-5">
              <MdEmail /> {userEmail}
            </p>

            <p className="flex items-center gap-5">
              <ImUser /> {userNameDisplay}
            </p>

            <p className="flex items-center gap-5">
              <CiCalendarDate /> {currentDate}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Sidebar Menu Items
  const MenuItems = (
    <>
      <div
        onClick={() => handleMenuClick("Dashboard")}
        className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
      >
        <RxDashboard /> Dashboard
      </div>

      <div
        className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
        onClick={toggleDropdown}
      >
        <RiVideoAddFill /> Video Conference
        {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </div>

      {isDropdownOpen && (
        <div className="flex flex-col gap-5 pl-6">
          <div
            onClick={() => handleMenuClick("Room")}
            className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
          >
            <IoHome /> Room
          </div>

          <div
            onClick={() => handleMenuClick("Meeting History")}
            className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
          >
            <TiGroup /> Meeting History
          </div>
        </div>
      )}

      <div
        onClick={() => handleMenuClick("Profile")}
        className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
      >
        <ImUser /> Profile
      </div>

      <div
        onClick={handleLogout}
        className="flex items-center gap-7 p-2 cursor-pointer hover:bg-gray-100 rounded-md text-red-500"
      >
        <CiLogout /> Logout
      </div>

      <div className="absolute bottom-0 left-0 flex items-center text-xs text-gray-500 p-4">
        <img src={img} className="w-[32px] mr-2" />
        © {new Date().getFullYear()} Chromameet. All rights reserved.
      </div>
    </>
  );

  return (
    <div className="lg:flex">
      {/* Mobile toggle */}
      <div
        className="px-6 pt-20 text-xl flex lg:hidden cursor-pointer"
        onClick={toggleMenu}
      >
        {isMenuOpen ? <IoCloseSharp /> : <RiMenuFoldFill />}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed z-20 top-20 left-0 bg-white shadow-lg w-[80%] h-full pl-7 py-10 flex flex-col gap-6"
        >
          {MenuItems}
        </div>
      )}

      {/* Sidebar */}
      <div className="hidden lg:flex w-[20%] flex-col pl-7 mt-36 gap-6 h-[80vh] overflow-auto shadow-lg bg-white rounded-r-md">
        {MenuItems}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:mt-36 mt-14">{renderContent()}</div>
    </div>
  );
}

export default Dashboard;


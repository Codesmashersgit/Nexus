import React, { useState, useEffect, useRef } from 'react';
import { RxDashboard } from "react-icons/rx";
import { RiVideoAddFill, RiMenuFoldFill, RiLockPasswordFill} from "react-icons/ri";
import { ImUser } from "react-icons/im";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { TiGroup } from "react-icons/ti";
import { CiLogout } from "react-icons/ci";
import Home from '../pages/Home';
import { FaEdit } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { IoCloseSharp } from "react-icons/io5";





function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const menuRef = useRef();
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
const [roomName, setRoomName] = useState("");
const [roomList, setRoomList] = useState([]);
const [isLogged, setisLogged] = useState(false);
const navigate= useNavigate();
 
const CLIENT_URL = import.meta.env.CLIENT_URL || "http://localhost:5173";
  // Toggle dropdown
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  
const handleCreateRoom = (e) => {
  e.preventDefault();
  const now = new Date();
  const newRoom = {
    id: uuidv4(),
    name: roomName,
    createdAt: now.toLocaleString(),
  };
  setRoomList(prev => [...prev, newRoom]);
  setRoomName("");
  setShowCreateRoomForm(false);
};



 

useEffect(() => {
  const storedRooms = localStorage.getItem("rooms");
  if (storedRooms) setRoomList(JSON.parse(storedRooms));
  const token = localStorage.getItem("authToken");
    setisLogged(!!token); // true if token exists
  }, []); // component mount par run karega
;

useEffect(() => {
  localStorage.setItem("rooms", JSON.stringify(roomList));
}, [roomList]);


  const handleMenuClick = (sectionName) => {
    setActiveSection(sectionName);
    if (window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  };
  const handleLogout = () => {
  if (window.confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setisLogged(false);
    alert("You have been logged out successfully!");
    window.location.href = "/"; 
  }
};


  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className='shadow-lg p-6 rounded-md bg-slate-200'>
            <h2 className='text-2xl font-bold mb-4'>Dashboard Overview</h2>
            <div className='flex flex-wrap gap-10'>
              <div className="bg-green-500 text-white px-12 py-6 rounded-lg flex items-center gap-4">
                <RiVideoAddFill className='text-3xl' />
                <div>0<br /><span>Total Meetings</span></div>
              </div>
              <div className="bg-red-500 text-white px-12 py-6 rounded-lg flex items-center gap-4">
                <TiGroup className='text-3xl' />
                <div>0<br /><span>Total Users</span></div>
              </div>
            </div>
          </div>
        );
      case "Room":
        return(
         <>
     
    <div className='bg-slate-200 lg:flex flex-col shadow-lg rounded-md p-5 gap-5'>
      <p className='text-lg font-semibold'>My Rooms</p>

      {roomList.length === 0 ? (
        <p className='text-gray-700'>You haven't created any rooms yet.</p>
      ) : (
       <ul className='list-disc pl-5 space-y-4'>
  {roomList.map((room, index) => {
    const roomURL = `${CLIENT_URL}/room/${room.name}`;
const shareText = `Join my video room "${room.name}": ${roomURL}`;
const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareText)}`;


    return (
      <li key={index} className='flex items-center justify-between pr-4'>
        <div>
          <strong>{room.name}</strong> — Created at: <em>{room.createdAt}</em><br />
          <a href={roomURL} rel="noopener noreferrer" className='text-blue-600 underline'>
            Open Room
          </a>
        </div>
        <a href={whatsappURL} target="_blank" rel="noopener noreferrer" className='text-green-600 text-xl hover:text-green-800'>
          <FaWhatsapp title="Share on WhatsApp" />
        </a>
      </li>
    );
  })}
</ul>


      )}

      {showCreateRoomForm ? (
        <form onSubmit={handleCreateRoom} className='mt-5 flex flex-col gap-4'>
          <input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            className='border px-4 py-2 rounded-md'
          />
          <div className='flex gap-3'>
            <button type="submit" className='bg-green-500 text-white px-4 py-2 rounded-md'>
              Save Room
            </button>
            <button type="button" onClick={() => setShowCreateRoomForm(false)} className='bg-gray-400 text-white px-4 py-2 rounded-md'>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowCreateRoomForm(true)}
          className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors mt-5'
        >
          Create Room
        </button>
      )}
    </div>

  </>
        );
      case "Meeting History":
        return(
        <>
        <div className='bg-slate-200 shadow-lg p-6 rounded-md flex flex-col gap-7'>
          <h2 className='font-bold mb-4'>My Meetings</h2>
          <p className=' font-normal'>No Meeting were found!</p>
          <p className=' font-normal'>You don't have any meetings yet or couldn't find meetings you're searching for!</p>
          </div>
       
        </>
        );
      case "Profile":
        return (
          <>
          <div className='shadow-lg lg:mt-[10px] lg:p-6 py-4 lg:w-1/2 rounded-md bg-slate-200 mt-[-60px] flex flex-col text-center lg:text-start gap-5'>
            <div className='flex items-center justify-center lg:justify-start'>
            <h2 className='text-green-500 bg-white text-center rounded-full px-6 py-4 text-4xl font-bold '>S</h2></div>
            <h2 className=' flex items-center gap-5'><MdEmail />sudhanshu.ok1802@gmail.com</h2>
            <p className=' flex items-center gap-5'><ImUser />Sudhanshu Raj</p>
            <p className='flex items-center gap-5'><CiCalendarDate />May 27th 2025, 10:44:43 am</p>
            <p className='flex gap-5 items-center'><FaEdit />Edit Profile</p>

            


            </div>

          </>
        )
    
        
      case "Logout":
        return (
          <>
        {isLogged ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={() => navigate("/login")}>Login</button>
      )}
      </>
    );
      default:
        return null;
    }
  };

  const MenuItems = (
    <>
      <div onClick={() => handleMenuClick("Dashboard")} className='flex items-center gap-7 p-2 cursor-pointer'>
        <RxDashboard />Dashboard
      </div>

      <div className="flex items-center gap-7 cursor-pointer p-2" onClick={toggleDropdown}>
        <RiVideoAddFill />
        <p className="m-0">Video Conference</p>
        {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </div>

      {isDropdownOpen && (
        <div className="flex flex-col gap-5 pl-6">
          <div onClick={() => handleMenuClick("Room")} className='flex items-center gap-7 p-2 cursor-pointer'>
            <IoHome />Room
          </div>
          <div onClick={() => handleMenuClick("Meeting History")} className='flex items-center gap-7 p-2 cursor-pointer'>
            <TiGroup />Meeting History
          </div>
        </div>
      )}

      <div onClick={() => handleMenuClick("Profile")} className='flex items-center gap-7 p-2 cursor-pointer'>
        <ImUser />Profile
      </div>
       <div onClick={handleLogout} className='flex items-center gap-7 p-2 cursor-pointer'>
        <CiLogout />Logout
      </div>

      <div className="absolute bottom-0 left-0 flex items-center text-xs text-gray-500 p-4">
        <img src='https://png.pngtree.com/template/20190530/ourmid/pngtree-letter-c-logo-vector-image_204408.jpg' className='w-[32px] mr-2' alt='logo'/>
        © {new Date().getFullYear()} Chromameet. All rights reserved.
      </div>
    </>
  );

  return (
    <div className='lg:flex'>
      {/* Mobile Menu Button */}
      <div className="px-6 pt-20 text-xl flex lg:hidden cursor-pointer" onClick={toggleMenu}>
        {isMenuOpen ? <IoCloseSharp />: <RiMenuFoldFill />}
      </div>

      {/* Sidebar - Mobile */}
      {isMenuOpen && (
        <div ref={menuRef} className='fixed z-20 top-20 left-0 bg-white shadow-lg w-[80%] h-full pl-7 py-10 flex flex-col gap-6'>
          {MenuItems}
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className='hidden lg:flex w-[20%] flex-col pl-7 mt-36 gap-6 h-[80vh] overflow-auto shadow-lg bg-white rounded-r-md'>
        {MenuItems}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-6 lg:mt-36 mt-14'>
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;

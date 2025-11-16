import React, { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const RoomAccess = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { isLoggedIn } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [room, setRoom] = useState(roomId || "");

  const handleJoin = () => {
    if (!name || !room) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem("guestName", name);
    localStorage.setItem("guestRoom", room);

    navigate(`/room/${room}`);
  };

  if (isLoggedIn) {
    navigate(`/room/${roomId}`);
    return null;
  }

  return (
    <div className="flex flex-col gap-3 py-52  items-center">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-30 z-0" />

      <h2 className="text-3xl md:text-[50px] z-10 font-bold leading-tight text-[#fa1239]">Enter Room Credentials</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-[#fa1239] rounded-[20px] py-2 px-6 outline-none w-1/3 z-10"
      />
      <input
        type="text"
        placeholder="Room Name / ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="border border-[#fa1239] rounded-[20px] py-2 px-6 outline-none w-1/3 z-10"
      />
      
      <button onClick={handleJoin} className=" bg-[#fa1239] text-white rounded-[20px] py-2 px-6 outline-none w-1/3 z-10 text-center">Join Room</button>
    </div>
  );
};

export default RoomAccess;

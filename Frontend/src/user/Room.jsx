
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRTC } from "../context/RTCContext";
import { AuthContext } from "../AuthContext";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
import { MdScreenShare, MdCallEnd } from "react-icons/md";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const {
    connectSocket,
    startRoom,
    localStream,
    remoteStream,
    messages,
    sendChatMessage,
    connectedUser,
    toggleMic,
    toggleCamera,
    startScreenShare,
    endCall: rtcEndCall,
    localVideoRef,
    remoteVideoRef
  } = useRTC();

  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");

  // Mic & Camera state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Attach local and remote streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;

      // Ensure tracks start enabled
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = true;

      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = true;
    }
    if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  // Initialize room & user
  useEffect(() => {
    if (!roomId) {
      alert("Room ID missing!");
      navigate("/");
      return;
    }

    if (isLoggedIn) {
      const storedUsername = localStorage.getItem("username") || "User";
      setUsername(storedUsername);

      connectSocket();
      startRoom(roomId);
    } else {
      // Guest
      const guestName = localStorage.getItem("guestName");
      const guestRoom = localStorage.getItem("guestRoom");

      if (!guestName || guestRoom !== roomId) {
        navigate(`/room-access/${roomId}`);
        return;
      }

      setUsername(guestName);

      connectSocket();
      startRoom(roomId);
    }
  }, [isLoggedIn, roomId]);

  // Cleanup guest data on unmount
  useEffect(() => {
    return () => {
      clearGuestData();
    };
  }, []);

  const clearGuestData = () => {
    localStorage.removeItem("guestName");
    localStorage.removeItem("guestRoom");
    console.log("Guest data cleared from localStorage");
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput);
    setMessageInput("");
  };

  const handleEndCall = () => {
    rtcEndCall();
    if (!isLoggedIn) clearGuestData();
    navigate("/dashboard");
  };

  // Toggle handlers
  const handleToggleMic = () => {
    toggleMic();
    setIsMicOn(prev => !prev);
  };

  const handleToggleCamera = () => {
    toggleCamera();
    setIsCameraOn(prev => !prev);
  };

  return (
    <div className="flex h-screen w-full text-white">

      {/* LEFT SIDE — VIDEO CALL */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-40 h-28 object-cover rounded-md border border-gray-500 absolute bottom-24 right-6 bg-black"
        />

        {/* Google Meet–style controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-6">
          {/* Mic Toggle */}
          <button
            onClick={handleToggleMic}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 ${
              isMicOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {isMicOn ? (
              <FaMicrophone className="w-6 h-6 text-white" />
            ) : (
              <FaMicrophoneSlash className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={handleToggleCamera}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 ${
              isCameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {isCameraOn ? (
              <IoVideocam className="w-6 h-6 text-white" />
            ) : (
              <IoVideocamOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={startScreenShare}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors duration-200"
          >
            <MdScreenShare className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-200"
          >
            <MdCallEnd className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — CHAT */}
      <div className="w-[340px] flex flex-col border-l border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold">Chat</h3>
          <p className="text-sm text-gray-400">
            Connected: {connectedUser || "Waiting..."} | You: {username}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 ${m.sender === "me" ? "text-right text-black" : "text-black"}`}
            >
              <strong>{m.sender}: </strong> {m.msg}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700 flex">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 rounded-l outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="px-4 bg-blue-600 rounded-r hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
};

export default Room;




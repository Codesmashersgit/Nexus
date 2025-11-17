

import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRTC } from "../context/RTCContext";
import { AuthContext } from "../AuthContext";
import { FaMicrophone, FaMicrophoneSlash, FaCommentDots } from "react-icons/fa";
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false); // Mobile chat toggle

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  useEffect(() => {
    return () => {
      localStorage.removeItem("guestName");
      localStorage.removeItem("guestRoom");
    };
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput);
    setMessageInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleEndCall = () => {
    rtcEndCall();
    if (!isLoggedIn) {
      localStorage.removeItem("guestName");
      localStorage.removeItem("guestRoom");
    }
    navigate("/dashboard");
  };

  const handleToggleMic = () => {
    toggleMic();
    setIsMicOn(prev => !prev);
  };

  const handleToggleCamera = () => {
    toggleCamera();
    setIsCameraOn(prev => !prev);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full text-white">
      {/* VIDEO SECTION */}
      <div className="flex-1 relative flex flex-col lg:flex-row bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full lg:w-1/2 h-1/2 lg:h-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full lg:w-1/2 h-1/2 lg:h-full object-cover border border-gray-500"
        />

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 lg:gap-6">
          <button
            onClick={handleToggleMic}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isMicOn ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMicOn ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
          </button>

          <button
            onClick={handleToggleCamera}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isCameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {isCameraOn ? <IoVideocam className="w-5 h-5" /> : <IoVideocamOff className="w-5 h-5" />}
          </button>

          <button
            onClick={startScreenShare}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500"
          >
            <MdScreenShare className="w-5 h-5" />
          </button>

          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500"
          >
            <MdCallEnd className="w-5 h-5" />
          </button>

          {/* Chat toggle button for mobile */}
          <button
            onClick={() => setIsChatOpen(prev => !prev)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 lg:hidden"
          >
            <FaCommentDots className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CHAT SECTION */}
      <div
        className={`fixed lg:relative top-0 right-0 h-full w-full lg:w-[440px] bg-gray-900 z-50 transform transition-transform duration-300 ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Chat</h3>
              <p className="text-sm text-gray-400">
                Connected: {connectedUser || "Waiting..."} | You: {username}
              </p>
            </div>
            {/* Close button on mobile */}
            <button className="lg:hidden" onClick={() => setIsChatOpen(false)}>
              ✖
            </button>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
            {messages.map((m, i) => (
            <div key={i} className={`flex items-center px-2 ${m.sender === "M" ? "justify-end" : "justify-start"}`}>
              <strong className={`bg-yellow-500 rounded-full px-4 py-3 mr-2`}>{m.sender}</strong>
              <span className={`max-w-[70%] break-words ${m.sender === "M" ? "text-black" : "text-black"}`}>
                {m.msg}
              </span>
            </div>
          ))}
          </div>

          <div className="p-3 border-t border-gray-700 flex items-end">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-700 rounded-l outline-none resize-none overflow-hidden text-white"
              rows={1}
            />
            <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 rounded-r hover:bg-blue-500">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;


import React, { useEffect, useState, useContext, useRef } from "react";
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Attach local and remote streams
  useEffect(() => {
    if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  // Auto scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Cleanup guest data
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

    // Reset textarea height
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

    // Auto-grow textarea vertically
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex h-screen w-full text-white">
      {/* LEFT — Video */}
      <div className="flex-1 relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
        <video ref={localVideoRef} autoPlay playsInline muted className="w-40 h-28 object-cover rounded-md border border-gray-500 absolute bottom-24 right-6 bg-black" />

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-6">
          <button onClick={handleToggleMic} className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 ${isMicOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"}`}>
            {isMicOn ? <FaMicrophone className="w-6 h-6 text-white" /> : <FaMicrophoneSlash className="w-6 h-6 text-white" />}
          </button>

          <button onClick={handleToggleCamera} className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 ${isCameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"}`}>
            {isCameraOn ? <IoVideocam className="w-6 h-6 text-white" /> : <IoVideocamOff className="w-6 h-6 text-white" />}
          </button>

          <button onClick={startScreenShare} className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors duration-200">
            <MdScreenShare className="w-6 h-6 text-white" />
          </button>

          <button onClick={handleEndCall} className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-200">
            <MdCallEnd className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* RIGHT — Chat */}
      <div className="w-[440px] flex flex-col border-l border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold">Chat</h3>
          <p className="text-sm text-gray-400">Connected: {connectedUser || "Waiting..."} | You: {username}</p>
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-center px-2 ${m.sender === "M" ? "justify-end" : "justify-start"}`}>
              <strong className={`bg-yellow-500 rounded-full px-4 py-3 mr-2`}>{m.sender}</strong>
              <span className={`max-w-[70%] break-words ${m.sender === "M" ? "text-black" : "text-black"}`}>
                {m.msg}
              </span>
            </div>
          ))}
        </div>

        {/* Auto-resizing textarea */}
        <div className="p-3 border-t border-gray-700 flex items-end">
          <textarea
            ref={textareaRef}
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 rounded-l outline-none resize-none overflow-hidden text-white"
            rows={1} // start with 1 row
          />
          <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 rounded-r hover:bg-blue-500">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Room;

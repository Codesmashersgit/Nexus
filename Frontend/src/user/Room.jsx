

// import React, { useEffect, useState, useContext, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useRTC } from "../context/RTCContext";
// import { AuthContext } from "../AuthContext";
// import { FaMicrophone, FaMicrophoneSlash, FaCommentDots } from "react-icons/fa";
// import { IoVideocam, IoVideocamOff } from "react-icons/io5";
// import { MdScreenShare, MdCallEnd } from "react-icons/md";

// const Room = () => {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const { isLoggedIn } = useContext(AuthContext);

//   const {
//     connectSocket,
//     startRoom,
//     localStream,
//     remoteStream,
//     messages,
//     sendChatMessage,
//     connectedUser,
//     toggleMic,
//     toggleCamera,
//     startScreenShare,
//     endCall: rtcEndCall,
//     localVideoRef,
//     remoteVideoRef
//   } = useRTC();

//   const [messageInput, setMessageInput] = useState("");
//   const [username, setUsername] = useState("");
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isChatOpen, setIsChatOpen] = useState(false); // Mobile chat toggle

//   const chatContainerRef = useRef(null);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
//     if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//   }, [localStream, remoteStream]);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (!roomId) {
//       alert("Room ID missing!");
//       navigate("/");
//       return;
//     }

//     if (isLoggedIn) {
//       const storedUsername = localStorage.getItem("username") || "User";
//       setUsername(storedUsername);
//       connectSocket();
//       startRoom(roomId);
//     } else {
//       const guestName = localStorage.getItem("guestName");
//       const guestRoom = localStorage.getItem("guestRoom");
//       if (!guestName || guestRoom !== roomId) {
//         navigate(`/room-access/${roomId}`);
//         return;
//       }
//       setUsername(guestName);
//       connectSocket();
//       startRoom(roomId);
//     }
//   }, [isLoggedIn, roomId]);

//   useEffect(() => {
//     return () => {
//       localStorage.removeItem("guestName");
//       localStorage.removeItem("guestRoom");
//     };
//   }, []);

//   const handleSendMessage = () => {
//     if (!messageInput.trim()) return;
//     sendChatMessage(messageInput);
//     setMessageInput("");
//     if (textareaRef.current) textareaRef.current.style.height = "auto";
//   };

//   const handleEndCall = () => {
//     rtcEndCall();
//     if (!isLoggedIn) {
//       localStorage.removeItem("guestName");
//       localStorage.removeItem("guestRoom");
//     }
//     navigate("/dashboard");
//   };

//   const handleToggleMic = () => {
//     toggleMic();
//     setIsMicOn(prev => !prev);
//   };

//   const handleToggleCamera = () => {
//     toggleCamera();
//     setIsCameraOn(prev => !prev);
//   };

//   const handleInputChange = (e) => {
//     setMessageInput(e.target.value);
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   };

//   return (
//     <div className="flex flex-col lg:flex-row h-screen w-full text-white">
//       {/* VIDEO SECTION */}
//       <div className="flex-1 relative flex flex-col lg:flex-row bg-black">
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="w-full lg:w-1/2 h-1/2 lg:h-full object-cover"
//         />
//         <video
//           ref={localVideoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full lg:w-1/2 h-1/2 lg:h-full object-cover border border-gray-500"
//         />

//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 lg:gap-6">
//           <button
//             onClick={handleToggleMic}
//             className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
//               isMicOn ? "bg-gray-700 hover:bg-gray-600": "bg-red-600 hover:bg-red-500"
//             }`}
//           >
//             {isMicOn ? <FaMicrophone className="w-5 h-5" /> : <FaMicrophoneSlash className="w-5 h-5" />}
//           </button>

//           <button
//             onClick={handleToggleCamera}
//             className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
//               isCameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
//             }`}
//           >
//             {isCameraOn ? <IoVideocam className="w-5 h-5" /> : <IoVideocamOff className="w-5 h-5" />}
//           </button>

//           <button
//             onClick={startScreenShare}
//             className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500"
//           >
//             <MdScreenShare className="w-5 h-5" />
//           </button>

//           <button
//             onClick={handleEndCall}
//             className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500"
//           >
//             <MdCallEnd className="w-5 h-5" />
//           </button>

//           {/* Chat toggle button for mobile */}
//           <button
//             onClick={() => setIsChatOpen(prev => !prev)}
//             className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 lg:hidden"
//           >
//             <FaCommentDots className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* CHAT SECTION */}
//       <div
//         className={`fixed lg:relative top-0 right-0 h-full w-full lg:w-[440px] bg-gray-900 z-50 transform transition-transform duration-300 ${
//           isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//             <div>
//               <h3 className="text-xl font-bold">Chat</h3>
//               <p className="text-sm text-gray-400">
//                 Connected: {connectedUser || "Waiting..."} | You: {username}
//               </p>
//             </div>
//             {/* Close button on mobile */}
//             <button className="lg:hidden" onClick={() => setIsChatOpen(false)}>
//               ✖
//             </button>
//           </div>

//           <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
//             {messages.map((m, i) => (
//             <div key={i} className={`flex items-center px-2 ${m.sender === "M" ? "justify-end" : "justify-start"}`}>
//               <strong className={`bg-yellow-500 rounded-full px-4 py-3 mr-2`}>{m.sender}</strong>
//               <span className={`max-w-[70%] break-words ${m.sender === "M" ? "text-black" : "text-black"}`}>
//                 {m.msg}
//               </span>
//             </div>
//           ))}
//           </div>

//           <div className="p-3 border-t border-gray-700 flex items-end">
//             <textarea
//               ref={textareaRef}
//               value={messageInput}
//               onChange={handleInputChange}
//               placeholder="Type a message..."
//               className="flex-1 px-3 py-2 bg-gray-700 rounded-l outline-none resize-none overflow-hidden text-white"
//               rows={1}
//             />
//             <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 rounded-r hover:bg-blue-500">
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Room;


import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRTC } from "../context/RTCContext";
import { AuthContext } from "../authContext";
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Update video streams when they change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, localVideoRef, remoteVideoRef]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize room
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        if (!roomId) {
          setError("Room ID missing!");
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
        setIsLoading(false);
      } catch (err) {
        setError("Failed to join room");
        setIsLoading(false);
        console.error("Room initialization error:", err);
      }
    };

    initializeRoom();
  }, [isLoggedIn, roomId, navigate, connectSocket, startRoom]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      rtcEndCall();
      if (!isLoggedIn) {
        localStorage.removeItem("guestName");
        localStorage.removeItem("guestRoom");
      }
    };
  }, [rtcEndCall, isLoggedIn]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput);
    setMessageInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  const handleScreenShare = async () => {
    try {
      await startScreenShare();
      setIsSharing(prev => !prev);
    } catch (error) {
      console.error("Screen share failed:", error);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Joining room...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full text-white">
      {/* VIDEO SECTION */}
      <div className="flex-1 relative flex flex-col lg:flex-row bg-black">
        {!remoteStream ? (
          // Single user view
          <div className="flex-1 flex items-center justify-center relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-20 text-center">
              <p className="text-lg">Waiting for someone to join...</p>
              <p className="text-sm text-gray-400">Room: {roomId}</p>
            </div>
          </div>
        ) : (
          // Two users view
          <>
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
          </>
        )}

        {/* Control Buttons */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 lg:gap-6">
          <button
            onClick={handleToggleMic}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isMicOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
            aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? <FaMicrophone className="w-5 h-5" /> : <FaMicrophoneSlash className="w-5 h-5" />}
          </button>

          <button
            onClick={handleToggleCamera}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isCameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
            aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <IoVideocam className="w-5 h-5" /> : <IoVideocamOff className="w-5 h-5" />}
          </button>

          <button
            onClick={handleScreenShare}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isSharing ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"
            }`}
            aria-label={isSharing ? "Stop screen share" : "Start screen share"}
          >
            <MdScreenShare className="w-5 h-5" />
          </button>

          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-200"
            aria-label="End call"
          >
            <MdCallEnd className="w-5 h-5" />
          </button>

          {/* Chat toggle button for mobile */}
          <button
            onClick={() => setIsChatOpen(prev => !prev)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 lg:hidden transition-colors duration-200"
            aria-label="Toggle chat"
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
            <button 
              className="lg:hidden text-xl hover:text-gray-300 transition-colors"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
            >
              ✖
            </button>
          </div>

          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <FaCommentDots className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.sender === username ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    m.sender === username 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-white"
                  }`}>
                    {m.sender !== username && (
                      <div className="text-xs font-semibold mb-1 text-blue-300">
                        {m.sender}
                      </div>
                    )}
                    <div className="break-words whitespace-pre-wrap">{m.msg}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700 flex items-end bg-gray-900">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Press Enter to send)"
              className="flex-1 px-3 py-2 bg-gray-700 rounded-l outline-none resize-none overflow-hidden text-white placeholder-gray-400"
              rows={1}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!messageInput.trim()}
              className="px-4 py-2 bg-blue-600 rounded-r hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
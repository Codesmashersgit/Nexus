import React, { useEffect, useState, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRTC } from "../context/RTCContext";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPaperPlane,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaComments,
  FaTimes,
  FaBell,
  FaFileAlt,
  FaImage
} from "react-icons/fa";
import Avatar from "../components/Avatar";

// Stable Video Component to prevent freezing/re-renders
const VideoPlayer = memo(({ stream, isLocal = false, label = "" }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl h-full flex items-center justify-center transition-all duration-500">
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className={`w-full h-full object-cover ${isLocal ? "transform scale-x-[-1]" : ""}`}
      />
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 z-10">
        <Avatar name={label} size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
});

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    localStream,
    remoteStreams,
    remoteUsers,
    startRoom,
    messages,
    sendChatMessage,
    sendMedia,
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    endCall,
    error
  } = useRTC();

  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const chatEndRef = useRef(null);
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    startRoom(roomId);
  }, [roomId, startRoom]);

  // Notification Logic
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender !== "Me") {
        if (!isChatOpen) {
          setShowNotification(true);
          // Play a subtle sound or just show toast
          setTimeout(() => setShowNotification(false), 5000);
        }
      }
      prevMessagesCount.current = messages.length;
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large (max 5MB)");
        return;
      }
      sendMedia(file);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl text-center shadow-2xl max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Connection Failed</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={() => navigate("/dashboard")} className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold transition-all">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const remoteUsersList = Object.entries(remoteStreams);
  const isPeerConnected = remoteUsersList.length > 0;

  return (
    <div className="fixed inset-0 bg-black text-slate-100 overflow-hidden font-sans flex flex-col items-stretch">

      {/* Toast Notification */}
      {showNotification && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-3xl text-white px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 animate-slideDown cursor-pointer border border-white/10 max-w-[90vw] md:max-w-md"
          onClick={() => { setIsChatOpen(true); setShowNotification(false); }}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FaComments className="text-sm animate-pulse" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-500 mb-0.5">New Message Received</span>
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-bold text-sm text-slate-100 italic">{messages[messages.length - 1]?.sender?.slice(0, 10)}:</span>
              <span className="text-sm text-slate-300 font-medium truncate">"{messages[messages.length - 1]?.msg}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-row relative overflow-hidden">

        {/* Videos Area - RESIZES on PC when chat opens */}
        <div className="flex-1 relative flex flex-col bg-slate-950 transition-all duration-500 ease-in-out">
          <div className={`
            flex-1 w-full h-full p-2 md:p-6 grid gap-2 md:gap-4
            ${isPeerConnected ? "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1" : "grid-cols-1 grid-rows-1"}
          `}>

            {/* Remote Video (Swapped to Left side) */}
            {isPeerConnected ? (
              remoteUsersList.map(([userId, stream]) => (
                <VideoPlayer key={userId} stream={stream} label={remoteUsers[userId]?.name || "Guest User"} />
              ))
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-3xl opacity-10">
                <span className="text-xs font-black tracking-[0.5em] uppercase">Waiting for guest</span>
              </div>
            )}

            {/* Local Video (Stay next to chat) */}
            <VideoPlayer stream={localStream} isLocal={true} label={localStorage.getItem("username") || localStorage.getItem("guestName") || "You"} />

          </div>
        </div>

        {/* Chat Sidebar - Collapses the video area on PC */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-full md:relative md:inset-auto md:z-10 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 flex flex-col
          transition-all duration-500 ease-in-out shadow-2xl overflow-hidden
          ${isChatOpen ? "translate-x-0 md:w-80 lg:w-96 border-l" : "translate-x-full md:w-0 md:opacity-0 md:pointer-events-none border-none"}
        `}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-blue-100 whitespace-nowrap">In-Call Messages</h2>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><FaTimes size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.sender === "Me" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar name={m.sender} size="sm" />
                <div className={`flex flex-col ${m.sender === "Me" ? "items-end" : "items-start"}`}>
                  <div className={`
                    max-w-[200px] md:max-w-xs px-4 py-3 rounded-2xl text-[13px] leading-relaxed
                    ${m.sender === "Me"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10"
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-md"}
                  `}>
                    {m.sender !== "Me" && <span className="block text-[8px] font-black uppercase text-blue-400 mb-1">{m.sender.slice(0, 15)}</span>}

                    {m.type === "image" ? (
                      <div className="space-y-2">
                        <img src={m.metadata.data} alt="uploaded" className="rounded-lg max-w-full cursor-pointer hover:opacity-90" onClick={() => window.open(m.metadata.data)} />
                        <span className="text-[10px] opacity-70 underline block">{m.msg}</span>
                      </div>
                    ) : m.type === "video" ? (
                      <video src={m.metadata.data} controls className="rounded-lg max-w-full" />
                    ) : m.type === "file" ? (
                      <a href={m.metadata.data} download={m.metadata.name} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-all">
                        <FaFileAlt className="text-blue-400" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate font-bold text-[11px]">{m.metadata.name}</span>
                          <span className="text-[9px] opacity-50">{(m.metadata.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </a>
                    ) : (
                      <p className="break-words">{m.msg}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 px-1 font-bold">{m.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-950/40 border-t border-white/5">
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Share Image">
                  <FaImage size={16} className="text-slate-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <label className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Share Documents">
                  <FaFileAlt size={16} className="text-slate-400" />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="relative group">
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full bg-slate-800/80 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 w-10 h-10 flex items-center justify-center rounded-xl transition-transform active:scale-95 shadow-xl shadow-blue-500/20">
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Control Bar - Optimized Bottom Positioning */}
      <div className={`
        fixed bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 md:gap-4
        bg-slate-900/80 backdrop-blur-2xl px-4 py-2.5 md:px-7 md:py-3.5 rounded-full border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]
        transition-all duration-500
        ${isChatOpen ? "max-md:opacity-0 max-md:pointer-events-none max-md:scale-90" : "opacity-100 scale-100"}
      `}>

        <button onClick={toggleMic} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isMicOn ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-red-500 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]"}`}>
          {isMicOn ? <FaMicrophone size={14} className="md:size-lg" /> : <FaMicrophoneSlash size={14} className="md:size-lg" />}
        </button>

        <button onClick={toggleCamera} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isCameraOn ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-red-500 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]"}`}>
          {isCameraOn ? <FaVideo size={14} className="md:size-lg" /> : <FaVideoSlash size={14} className="md:size-lg" />}
        </button>

        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isChatOpen ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
          <FaComments size={14} className="md:size-lg" />
        </button>

        <div className="w-px h-6 md:h-9 bg-white/10 mx-1 md:mx-2" />

        <button
          onClick={endCall}
          className="w-10 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-[0_8px_30px_rgba(220,38,38,0.4)] transition-all active:scale-95 group"
          title="End Call"
        >
          <FaPhoneSlash className="text-sm md:text-xl group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default Room;

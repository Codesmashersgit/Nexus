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
  FaImage,
  FaDesktop,
  FaCommentAlt,
  FaStop,
  FaTrash
} from "react-icons/fa";
import Avatar from "../components/Avatar";

// Stable Video Component to prevent freezing/re-renders
const VideoPlayer = memo(({ stream, isLocal = false, label = "", mode = "grid" }) => { // mode: 'grid' | 'full' | 'pip'
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const containerClasses = {
    grid: "relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl h-full flex items-center justify-center transition-all duration-500",
    full: "relative w-full h-full overflow-hidden bg-black flex items-center justify-center",
    pip: "relative w-full h-full rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
  };

  const labelClasses = {
    grid: "absolute bottom-20 md:bottom-auto md:top-4 left-4 px-3 py-1.5",
    full: "absolute bottom-24 md:bottom-auto md:top-6 left-6 px-4 py-2", // More clearance for controls
    pip: "absolute bottom-2 left-2 px-2 py-1"
  };

  const textClasses = {
    grid: "text-[10px] font-bold uppercase tracking-widest",
    full: "text-xs font-bold uppercase tracking-widest",
    pip: "text-[8px] font-bold uppercase tracking-wider"
  };

  return (
    <div className={containerClasses[mode] || containerClasses.grid}>
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className={`w-full h-full object-cover ${isLocal ? "transform scale-x-[-1]" : ""}`}
      />
      <div className={`flex items-center gap-2 z-10 ${labelClasses[mode] || labelClasses.grid}`}>
        <Avatar name={label} size={mode === "pip" ? "xs" : "sm"} />
        <span className={`${textClasses[mode] || textClasses.grid} text-white/90 shadow-sm`}>
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
    screenSharingId, // New State
    startRoom,
    messages,
    sendChatMessage,
    sendMedia,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
    error
  } = useRTC();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewMedia, setPreviewMedia] = useState(null); // { data, name, type }
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const [showNotification, setShowNotification] = useState(false);
  const chatEndRef = useRef(null);
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    startRoom(roomId);
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        sendMedia(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Mic access is required for voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent sending
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMediaOpen = (data, name, type, mimeType) => {
    // Check if it's a PDF by mimeType or file extension
    const isPDF = mimeType?.includes("pdf") || name?.toLowerCase().endsWith(".pdf");

    if (type === "image" || isPDF) {
      setPreviewMedia({ data, name, type: type === "image" ? "image" : "pdf" });
    } else {
      // Fallback to download for other file types
      const link = document.createElement("a");
      link.href = data;
      link.download = name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const remoteUsersList = Object.entries(remoteStreams);
  const isPeerConnected = remoteUsersList.length > 0;

  // Screen Share Layout Logic
  const isSharing = !!screenSharingId;
  let MainVideo = null;
  let PipVideo = null;

  if (isSharing) {
    if (screenSharingId === "me") {
      // I am sharing. Main = Me (Screen), Pip = Remote (Face)
      MainVideo = <VideoPlayer stream={localStream} isLocal={true} label="You (Screen)" mode="full" />;
      if (isPeerConnected) {
        const [rId, rStream] = remoteUsersList[0];
        PipVideo = <VideoPlayer stream={rStream} label={remoteUsers[rId]?.name} mode="pip" />;
      }
    } else {
      // Remote is sharing. Main = Remote (Screen), Pip = Me (Face)
      const rStream = remoteStreams[screenSharingId];
      const rName = remoteUsers[screenSharingId]?.name || "Presenter";
      MainVideo = <VideoPlayer stream={rStream} label={`${rName} (Screen)`} mode="full" />;
      PipVideo = <VideoPlayer stream={localStream} isLocal={true} label="You" mode="pip" />;
    }
  }

  return (
    <div className="fixed inset-0 bg-black text-slate-100 overflow-hidden font-sans flex flex-col items-stretch">
      {/* ... Toast ... (unchanged) */}

      {/* Main Container */}
      <div className="flex-1 flex flex-row relative overflow-hidden">

        {/* Videos Area */}
        <div className="flex-1 relative flex flex-col bg-slate-950 transition-all duration-500 ease-in-out">

          {isSharing ? (
            // SPOTLIGHT LAYOUT
            <div className="relative w-full h-full">
              {/* Main Screen */}
              <div className="absolute inset-0 z-0">
                {MainVideo}
              </div>

              {/* PiP */}
              {PipVideo && (
                <div className="absolute top-4 right-4 w-32 h-48 md:w-64 md:h-48 z-20 transition-all">
                  {PipVideo}
                </div>
              )}
            </div>
          ) : (
            // GRID LAYOUT (Existing)
            <div className={`
              flex-1 w-full h-full p-2 md:p-4 grid gap-2 md:gap-3
              ${isPeerConnected ? "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1" : "grid-cols-1 grid-rows-1"}
            `}>

              {/* Remote Video (Swapped to Left side) */}
              {isPeerConnected ? (
                remoteUsersList.map(([userId, stream]) => (
                  <VideoPlayer key={userId} stream={stream} label={remoteUsers[userId]?.name || "Guest User"} mode="grid" />
                ))
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-3xl opacity-10">
                  <span className="text-xs font-black tracking-[0.5em] uppercase">Waiting for guest</span>
                </div>
              )}

              {/* Local Video (Stay next to chat) */}
              <VideoPlayer stream={localStream} isLocal={true} label={localStorage.getItem("username") || "You"} mode="grid" />

            </div>
          )}
        </div>

        {/* ... Chat Sidebar (unchanged) ... */}

        {/* Chat Sidebar - Collapses the video area on PC */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-full md:relative md:inset-auto md:z-10 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 flex flex-col
          transition-all duration-500 ease-in-out shadow-2xl overflow-hidden
          ${isChatOpen ? "translate-x-0 md:w-80 lg:w-96 border-l" : "translate-x-full md:w-0 md:opacity-0 md:pointer-events-none border-none"}
        `}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <h2 className="font-bold text-[11px] uppercase tracking-[0.2em] text-blue-100 whitespace-nowrap">In-Call Messages</h2>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><FaTimes size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.sender === "Me" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar name={m.sender} size="sm" />
                <div className={`flex flex-col ${m.sender === "Me" ? "items-end" : "items-start"}`}>
                  <div className={`
                    max-w-[200px] md:max-w-xs ${m.type === 'text' ? 'px-4 py-3' : 'p-0'} rounded-2xl text-[13px] leading-relaxed
                    ${m.type === 'text'
                      ? m.sender === "Me"
                        ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-md"
                      : "bg-transparent"
                    }
                  `}>

                    {m.type === "image" ? (
                      <img
                        src={m.metadata.data}
                        alt="uploaded"
                        className="rounded-lg max-w-full cursor-pointer hover:opacity-90 border border-white/10"
                        onClick={() => handleMediaOpen(m.metadata.data, m.metadata.name, "image", m.metadata.mimeType)}
                      />
                    ) : m.type === "video" ? (
                      <video src={m.metadata.data} controls className="rounded-lg max-w-full border border-white/10" />
                    ) : m.type === "audio" ? (
                      <audio src={m.metadata.data} controls className="max-w-full h-8" />
                    ) : m.type === "file" ? (
                      <div onClick={() => handleMediaOpen(m.metadata.data, m.metadata.name, "file", m.metadata.mimeType)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                        <FaFileAlt className="text-blue-400" size={20} />
                        {m.metadata.mimeType?.includes("pdf") || m.metadata.name?.toLowerCase().endsWith(".pdf") ? (
                          <span className="text-[11px] font-normal truncate max-w-[150px]">{m.metadata.name}</span>
                        ) : (
                          <span className="text-[10px] opacity-50">{(m.metadata.size / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    ) : (
                      <p className="break-words font-normal">{m.msg}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 px-1 font-medium">{m.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-950/40 border-t border-white/5">
            {isRecording ? (
              <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-blue-100">Recording... {formatTime(recordingTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={cancelRecording} className="p-2 hover:bg-white/10 rounded-lg transition-all text-red-400">
                    <FaTrash size={14} />
                  </button>
                  <button onClick={stopRecording} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                    <FaStop size={10} /> Stop & Send
                  </button>
                </div>
              </div>
            ) : (
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
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    title="Voice message"
                  >
                    <FaMicrophone size={16} className="text-slate-400" />
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Send a message..."
                    className="w-full bg-slate-800/80 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 w-10 h-10 flex items-center justify-center rounded-xl transition-transform active:scale-95 shadow-xl shadow-blue-500/20">
                    <FaPaperPlane size={14} className="text-white" />
                  </button>
                </div>
              </form>
            )}
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

        <button onClick={toggleScreenShare} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isScreenSharing ? "bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`} title="Share Screen">
          <FaDesktop size={14} className="md:size-lg" />
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

      {previewMedia && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = previewMedia.data;
                link.download = previewMedia.name;
                link.click();
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              title="Download"
            >
              <FaFileAlt size={20} />
            </button>
            <button
              onClick={() => setPreviewMedia(null)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="w-full h-full flex items-center justify-center animate-in zoom-in duration-300">
            {previewMedia.type === "image" ? (
              <img
                src={previewMedia.data}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            ) : (
              <iframe
                src={previewMedia.data}
                className="w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden border-none"
                title="PDF Preview"
              />
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-white/80">{previewMedia.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;

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
const VideoPlayer = memo(({ stream, isLocal = false, label = "", mode = "grid", isCameraOn = true }) => {
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOn]);

  // Audio level detection for speaking
  useEffect(() => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContextRef.current.createMediaStreamSource(new MediaStream([audioTrack]));
        source.connect(analyser);
        analyserRef.current = analyser;

        const checkVolume = () => {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setIsSpeaking(average > 30);
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      }
    }
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream]);

  const containerClasses = {
    grid: "relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl h-full flex items-center justify-center transition-all duration-500",
    full: "relative w-full h-full overflow-hidden bg-black flex items-center justify-center",
    pip: "relative w-full h-full rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
  };

  const labelClasses = {
    grid: isMobile ? (isLocal ? "absolute bottom-4 left-4" : "absolute top-4 left-4") : "absolute bottom-20 md:bottom-auto md:top-4 left-4 px-3 py-1.5",
    full: "absolute bottom-24 md:bottom-auto md:top-6 left-6 px-4 py-2",
    pip: "absolute bottom-2 left-2 px-2 py-1"
  };

  const textClasses = {
    grid: isMobile ? "hidden" : "text-[10px] font-bold uppercase tracking-widest",
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
        className={`w-full h-full object-cover ${isLocal ? "transform scale-x-[-1]" : ""} ${isCameraOn ? "block" : "hidden"}`}
      />

      {!isCameraOn && (
        <div className="flex flex-col items-center justify-center w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-pulse" />
          <div className={`relative z-10 ${isSpeaking ? "scale-110" : "scale-100"} transition-transform duration-300`}>
            <div className={`relative ${isSpeaking ? "animate-pulse" : ""}`}>
              <Avatar name={label} size={mode === "pip" ? "lg" : "xl"} />
              {isSpeaking && (
                <>
                  <div className="absolute -inset-4 rounded-full border-2 border-[#fa1239]/40 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border-2 border-[#fa1239]/60 animate-pulse" />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isCameraOn && (
        <div className={`flex items-center gap-2 z-10 ${labelClasses[mode] || labelClasses.grid}`}>
          <Avatar name={label} size={mode === "pip" ? "xs" : "sm"} />
        </div>
      )}
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
    screenSharingId,
    startRoom,
    messages,
    sendChatMessage,
    sendMedia,
    clearMessages,
    isMicOn,
    isCameraOn,
    remoteCameraStatus,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
    networkMetrics,
    remoteTyping,
    sendTypingStatus,
    error
  } = useRTC();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null); // { sender, msg }
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewMedia, setPreviewMedia] = useState(null); // { data, name, type }
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    // Basic mobile/tablet detection
    const checkDevice = () => {
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 1024;
      setIsMobileDevice(isMobile);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    startRoom(roomId);
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      window.removeEventListener("resize", checkDevice);
    };
  }, [roomId, startRoom]);

  // Message & Notification & Badge Logic
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const lastMsg = messages[messages.length - 1];

      if (lastMsg.sender !== "Me") {
        if (!isChatOpen) {
          setUnreadCount(prev => prev + 1);
          // Only show popup on desktop
          if (!isMobileDevice) {
            setCurrentNotification({ sender: lastMsg.sender, msg: lastMsg.msg, type: lastMsg.type });
            setTimeout(() => setCurrentNotification(null), 6000);
          }
        }
      }
      prevMessagesCount.current = messages.length;
    }
  }, [messages.length, isChatOpen, isMobileDevice]);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
      setCurrentNotification(null);
    }
  }, [isChatOpen]);

  // Auto-scroll logic
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, remoteTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");

    // Stop typing indicator immediately on send
    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = (e) => {
    setChatInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      mediaRecorderRef.current.onstop = null;
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
    const isPDF = mimeType?.includes("pdf") || name?.toLowerCase().endsWith(".pdf");
    if (type === "image" || isPDF) {
      setPreviewMedia({ data, name, type: type === "image" ? "image" : "pdf" });
    } else {
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

  const isSharing = !!screenSharingId;
  let MainVideo = null;
  let PipVideo = null;

  if (isSharing) {
    if (screenSharingId === "me") {
      MainVideo = <VideoPlayer stream={localStream} isLocal={true} label="You (Screen)" mode="full" />;
      if (isPeerConnected) {
        const [rId, rStream] = remoteUsersList[0];
        PipVideo = <VideoPlayer stream={rStream} label={remoteUsers[rId]?.name} mode="pip" isCameraOn={remoteCameraStatus[rId] !== false} />;
      }
    } else {
      const rStream = remoteStreams[screenSharingId];
      const rName = remoteUsers[screenSharingId]?.name || "Presenter";
      MainVideo = <VideoPlayer stream={rStream} label={`${rName} (Screen)`} mode="full" isCameraOn={true} />;
      PipVideo = <VideoPlayer stream={localStream} isLocal={true} label="You" mode="pip" isCameraOn={isCameraOn} />;
    }
  }

  return (
    <div className="fixed inset-0 bg-black text-slate-100 overflow-hidden font-sans flex flex-col items-stretch text-sm md:text-base">
      <div className="flex-1 flex flex-row relative overflow-hidden">
        {/* Videos Area */}
        <div className="flex-1 relative flex flex-col bg-slate-950 transition-all duration-500 ease-in-out">
          {isSharing ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 z-0">{MainVideo}</div>
              {PipVideo && (
                <div className="absolute top-4 right-4 w-20 h-28 md:w-40 md:h-56 z-20 transition-all rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  {PipVideo}
                </div>
              )}
              <div className="absolute bottom-6 left-6 z-30 flex items-center gap-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/5">
                <Avatar
                  name={screenSharingId === "me" ? localStorage.getItem("username") : remoteUsers[screenSharingId]?.name}
                  size="md"
                />
              </div>
            </div>
          ) : (
            <div className={`flex-1 w-full h-full p-2 md:p-4 grid gap-2 md:gap-3 ${isPeerConnected ? "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1" : "grid-cols-1 grid-rows-1"}`}>
              {isPeerConnected ? (
                remoteUsersList.map(([userId, stream]) => (
                  <VideoPlayer key={userId} stream={stream} label={remoteUsers[userId]?.name || "Guest User"} mode="grid" isCameraOn={remoteCameraStatus[userId] !== false} />
                ))
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-3xl opacity-10">
                  <span className="text-xs font-black tracking-[0.5em] uppercase">Waiting for guest</span>
                </div>
              )}
              <VideoPlayer stream={localStream} isLocal={true} label={localStorage.getItem("username") || "You"} mode="grid" isCameraOn={isCameraOn} />
            </div>
          )}

          {/* Network Metrics HUD (Subtle) */}
          <div className="absolute top-4 left-4 z-[40] flex flex-col gap-1 pointer-events-none">
            {networkMetrics.rtt > 0 && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${networkMetrics.rtt > 200 ? "bg-red-500" : "bg-green-500"}`} />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">
                  Ping: {Math.round(networkMetrics.rtt)}ms | Loss: {Math.round(networkMetrics.packetLoss)}% | Jitter: {Math.round(networkMetrics.jitter)}ms
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-full md:relative md:inset-auto md:z-10 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 flex flex-col
          transition-all duration-500 ease-in-out shadow-2xl overflow-hidden
          ${isChatOpen ? "translate-x-0 md:w-80 lg:w-96 border-l" : "translate-x-full md:w-0 md:opacity-0 md:pointer-events-none border-none"}
        `}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#fa1239] shadow-[0_0_8px_#fa1239]" />
              <h2 className="font-bold text-[11px] uppercase tracking-[0.2em] text-[#fa1239]/80 whitespace-nowrap">In-Call Messages</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><FaTimes size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.sender === "Me" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar name={m.sender} size="sm" />
                <div className={`flex flex-col ${m.sender === "Me" ? "items-end" : "items-start"} max-w-[85%] md:max-w-[80%]`}>
                  <div className={`w-full ${m.type === 'text' ? 'px-4 py-3' : 'p-0'} rounded-2xl text-[13px] leading-relaxed ${m.type === 'text' ? (m.sender === "Me" ? "bg-slate-800 text-slate-200 rounded-tr-none border border-white/5 shadow-md" : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-md") : "bg-transparent"}`}>
                    {m.type === "image" ? (
                      <img src={m.metadata.data} alt="uploaded" className="rounded-lg max-w-full cursor-pointer hover:opacity-90 border border-white/10" onClick={() => handleMediaOpen(m.metadata.data, m.metadata.name, "image", m.metadata.mimeType)} />
                    ) : m.type === "video" ? (
                      <video src={m.metadata.data} controls className="rounded-lg max-w-full border border-white/10" />
                    ) : m.type === "audio" ? (
                      <audio src={m.metadata.data} controls className="max-w-full h-8" />
                    ) : m.type === "file" ? (
                      <div onClick={() => handleMediaOpen(m.metadata.data, m.metadata.name, "file", m.metadata.mimeType)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                        <FaFileAlt className="text-blue-400" size={20} />
                        <span className="text-[11px] font-normal truncate max-w-[150px]">{m.metadata.name}</span>
                      </div>
                    ) : (
                      <p className="break-words [overflow-wrap:anywhere] font-normal">{m.msg}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 px-1 font-medium">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator Bubbles */}
            {Object.values(remoteTyping).filter(u => u.isTyping).map((u, i) => (
              <div key={`typing-${i}`} className="flex gap-3 mb-6 animate-pulse">
                <Avatar name={u.name} size="sm" />
                <div className="flex flex-col items-start px-4 py-3 bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none border border-white/5 shadow-md">
                  <div className="flex gap-1 h-3 items-center">
                    <span className="w-1 h-1 bg-slate-400 rounded-full dot-1" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full dot-2" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full dot-3" />
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-950/40 border-t border-white/5">
            {isRecording ? (
              <div className="flex items-center justify-between bg-[#fa1239]/10 border border-[#fa1239]/20 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-100">Recording... {formatTime(recordingTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={cancelRecording} className="p-2 hover:bg-white/10 rounded-lg transition-all text-red-400"><FaTrash size={14} /></button>
                  <button onClick={stopRecording} className="bg-[#fa1239] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#fa1239]/80 transition-all flex items-center gap-2"><FaStop size={10} /> Stop & Send</button>
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
                  <button type="button" onClick={startRecording} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Voice message"><FaMicrophone size={16} className="text-slate-400" /></button>
                </div>
                <div className="relative group">
                  <input type="text" value={chatInput} onChange={handleTyping} placeholder="Send a message..." className="w-full bg-slate-800/80 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fa1239] hover:brightness-110 w-10 h-10 flex items-center justify-center rounded-xl transition-transform active:scale-95 shadow-xl shadow-[#fa1239]/20"><FaPaperPlane size={14} className="text-white" /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className={`fixed bottom-2 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 md:gap-4 bg-black/40 backdrop-blur-3xl px-4 py-2.5 md:px-7 md:py-3.5 rounded-full border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-500 ${isChatOpen ? "max-md:opacity-0 max-md:pointer-events-none max-md:scale-90" : "opacity-100 scale-100"}`}>
        <button onClick={toggleMic} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isMicOn ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-[#fa1239] border-[#fa1239] shadow-[0_0_25px_rgba(250,18,57,0.4)]"}`}>{isMicOn ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} />}</button>
        <button onClick={toggleCamera} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isCameraOn ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-[#fa1239] border-[#fa1239] shadow-[0_0_25px_rgba(250,18,57,0.4)]"}`}>{isCameraOn ? <FaVideo size={14} /> : <FaVideoSlash size={14} />}</button>
        {!isMobileDevice && (
          <button onClick={toggleScreenShare} className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isScreenSharing ? "bg-[#fa1239] border-[#fa1239] shadow-[0_0_25px_rgba(250,18,57,0.4)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`} title="Share Screen"><FaDesktop size={14} /></button>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`relative w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all border ${isChatOpen ? "bg-[#fa1239] border-[#fa1239] shadow-[0_0_20px_rgba(250,18,57,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
          <FaComments size={14} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#fa1239] text-white text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="w-px h-6 md:h-9 bg-white/10 mx-1 md:mx-2" />
        <button onClick={endCall} className="w-10 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-[#fa1239] hover:brightness-110 text-white shadow-[0_8px_30px_rgba(220,38,38,0.4)] transition-all active:scale-95 group" title="End Call"><FaPhoneSlash className="text-sm md:text-xl group-hover:scale-110 transition-transform" /></button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {previewMedia && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-sm">
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <button onClick={() => { const link = document.createElement("a"); link.href = previewMedia.data; link.download = previewMedia.name; link.click(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all" title="Download"><FaFileAlt size={20} /></button>
            <button onClick={() => setPreviewMedia(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><FaTimes size={24} /></button>
          </div>
          <div className="w-full h-full flex items-center justify-center animate-in zoom-in duration-300">
            {previewMedia.type === "image" ? <img src={previewMedia.data} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" /> : <iframe src={previewMedia.data} className="w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden border-none" title="PDF Preview" />}
          </div>
          <div className="mt-6 text-center"><p className="text-sm font-bold text-white/80">{previewMedia.name}</p></div>
        </div>
      )}

      {error === "Room is full" && (
        <div className="fixed inset-0 z-[1000] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-[#fa1239]/10 border border-[#fa1239]/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(250,18,57,0.2)]"><FaPhoneSlash className="text-[#fa1239] text-4xl" /></div>
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Room is <span className="text-[#fa1239]">Full</span></h1>
            <p className="text-gray-400 mb-10 leading-relaxed font-medium">Aree bhai, is room mein pehle se hi 2 log hain. Humne isse private rkha h taaki sirf best experience mile.</p>
            <button onClick={() => navigate("/dashboard")} className="w-full bg-[#fa1239] hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl shadow-[#fa1239]/20 transition-all active:scale-95">Back to Dashboard</button>
          </div>
        </div>
      )}

      {currentNotification && !isChatOpen && (
        <div onClick={() => { setIsChatOpen(true); setCurrentNotification(null); }} className="fixed top-6 right-6 z-[70] w-64 bg-slate-900 shadow-2xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all animate-slideIn group">
          <div className="relative shrink-0">
            <Avatar name={currentNotification.sender} size="sm" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#fa1239] rounded-full border-2 border-slate-900 shadow-[0_0_10px_#fa1239]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate font-medium">{currentNotification.type === 'text' ? currentNotification.msg : `Shared a ${currentNotification.type}`}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;

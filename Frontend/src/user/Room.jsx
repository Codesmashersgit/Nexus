import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Room({ roomname, userName }) {
  const [peers, setPeers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketId, setSocketId] = useState(null);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const messagesEndRef = useRef();
  const screenTrackRef = useRef();
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);

  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      setSocketId(socketRef.current.id);
    });

    // Get user media first
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current) userVideo.current.srcObject = stream;

        // Join room with name
        socketRef.current.emit("join-room", { roomID: roomname, name: userName });

        // Handle new user joined
        socketRef.current.on("user-joined", (userId) => {
          const peer = createPeer(userId, socketRef.current.id, stream);
          peersRef.current.push({ peerID: userId, peer });
          setPeers((prev) => [...prev, peer]);
        });

        // Handle receiving signal
        socketRef.current.on("signal", (data) => {
          const existingPeer = peersRef.current.find((p) => p.peerID === data.from);
          if (existingPeer) {
            existingPeer.peer.signal(data.signal);
          } else {
            const peer = addPeer(data.signal, data.from, stream);
            peersRef.current.push({ peerID: data.from, peer });
            setPeers((prev) => [...prev, peer]);
          }
        });

        // User left room
        socketRef.current.on("user-left", (userId) => {
          const peerObj = peersRef.current.find((p) => p.peerID === userId);
          if (peerObj) peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter((p) => p.peerID !== userId);
          setPeers(peersRef.current.map((p) => p.peer));
        });

        // Chat message received
        socketRef.current.on("receive-message", ({ id, name, message }) => {
          setChatMessages((msgs) => [...msgs, { id, name, message }]);
        });

        // Typing indicators
        socketRef.current.on("typing", ({ id, name }) => {
          setTypingUsers((prev) =>
            prev.find((user) => user.id === id) ? prev : [...prev, { id, name }]
          );
        });

        socketRef.current.on("stop-typing", ({ id }) => {
          setTypingUsers((prev) => prev.filter((user) => user.id !== id));
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        alert("Cannot access camera/microphone. Please allow permission.");
      });

    return () => {
      const socket = socketRef.current;
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
      peersRef.current.forEach(({ peer }) => peer.destroy());
      setPeers([]);
    };
  }, [roomname]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { to: userToSignal, from: callerID, signal });
    });
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { to: callerID, from: socketRef.current.id, signal });
    });
    peer.signal(incomingSignal);
    return peer;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current?.connected) return;
    socketRef.current.emit("send-message", { name: userName, message });
    setMessage("");
    socketRef.current.emit("stop-typing");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleMic = () => {
    const stream = userVideo.current?.srcObject;
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const stream = userVideo.current?.srcObject;
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            userVideo.current.srcObject.getVideoTracks()[0],
            screenTrack,
            userVideo.current.srcObject
          );
        });

        screenTrack.onended = stopScreenShare;
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = () => {
    const originalTrack = userVideo.current?.srcObject?.getVideoTracks()[0];
    peersRef.current.forEach(({ peer }) => {
      peer.replaceTrack(
        screenTrackRef.current,
        originalTrack,
        userVideo.current.srcObject
      );
    });

    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    setIsScreenSharing(false);
  };

  const endCall = () => {
    peersRef.current.forEach(({ peer }) => peer.destroy());
    socketRef.current?.disconnect();
    navigate("/dashboard");
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    const now = Date.now();

    if (now - lastTypingTime.current > 300) {
      socketRef.current.emit("typing", { name: userName });
      lastTypingTime.current = now;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop-typing");
    }, 1000);
  };

  return (
    <div className="flex md:flex-row h-screen fixed">
      {/* Video section */}
      <div className="relative md:w-3/4 w-full bg-black flex flex-col">
        <video
          muted
          ref={userVideo}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {peers.map((peer, index) => (
          <Video key={index} peer={peer} />
        ))}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6 bg-black bg-opacity-60 rounded-full px-6 py-3 z-50">
          <button onClick={toggleMic} title="Toggle Mic" className="text-white">
            <FontAwesomeIcon
              icon={isMicOn ? faMicrophone : faMicrophoneSlash}
              className="p-3 rounded-full bg-black"
              size="lg"
            />
          </button>
          <button onClick={toggleCamera} title="Toggle Camera" className="text-white">
            <FontAwesomeIcon
              icon={isCameraOn ? faVideo : faVideoSlash}
              className="p-3 rounded-full bg-black"
              size="lg"
            />
          </button>
          <button onClick={toggleScreenShare} title="Share Screen" className="text-white">
            <FontAwesomeIcon icon={faDesktop} className="p-3 rounded-full bg-black" size="lg" />
          </button>
          <button onClick={endCall} title="End Call" className="text-red-500">
            <FontAwesomeIcon icon={faPhoneSlash} className="p-3 rounded-full bg-black" size="lg" />
          </button>
        </div>
      </div>

      {/* Chat section */}
      <div className="md:w-1/4 hidden lg:flex md:h-full flex-col border-l border-gray-400 bg-gray-50">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatMessages.map((msg, idx) => (
            <div
              key={`${msg.id}-${idx}`}
              className={`rounded-full p-4 text-sm break-words ${
                msg.id === socketId ? "bg-gray-300 font-bold" : "bg-white"
              }`}
            >
              <strong>{msg.name || (msg.id === socketId ? "You" : "Unknown")}:</strong>{" "}
              {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        <div className="p-2 italic text-sm text-gray-600 min-h-[24px]">
          {typingUsers.length > 0 && (
            <>
              {typingUsers.map((user) => user.name).join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-2 border-t border-gray-300 bg-white">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onBlur={() => {
              clearTimeout(typingTimeoutRef.current);
              socketRef.current.emit("stop-typing");
            }}
            placeholder="Type message..."
            className="w-full px-3 py-2 border border-gray-400 rounded outline-none"
          />
        </form>
      </div>
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    const handleStream = (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    };
    peer.on("stream", handleStream);

    return () => peer.off("stream", handleStream);
  }, [peer]);

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className="w-full h-48 md:h-auto bg-black rounded mt-2"
    />
  );
}

export default Room;

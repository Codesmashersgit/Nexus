
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
  const screenTrackRef = useRef();
  const messagesEndRef = useRef();
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => setSocketId(socketRef.current.id));

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join-room", { roomID: roomname, name: userName });

        socketRef.current.on("all-users", (users) => {
          users.forEach((userId) => {
            const peer = createPeer(userId, socketRef.current.id, stream);
            peersRef.current.push({ peerID: userId, peer });
            setPeers((prev) => [...prev, { peerID: userId, peer }]);
          });
        });

        socketRef.current.on("user-joined", (userId) => {
          const peer = addPeer(null, userId, stream);
          peersRef.current.push({ peerID: userId, peer });
          setPeers((prev) => [...prev, { peerID: userId, peer }]);
        });

        socketRef.current.on("signal", (data) => {
          const existingPeer = peersRef.current.find((p) => p.peerID === data.from);
          if (existingPeer) {
            existingPeer.peer.signal(data.signal);
          } else {
            const peer = addPeer(data.signal, data.from, stream);
            peersRef.current.push({ peerID: data.from, peer });
            setPeers((prev) => [...prev, { peerID: data.from, peer }]);
          }
        });

        socketRef.current.on("user-left", (userId) => {
          const peerObj = peersRef.current.find((p) => p.peerID === userId);
          if (peerObj) peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter((p) => p.peerID !== userId);
          setPeers(peersRef.current.map((p) => ({ peerID: p.peerID, peer: p.peer })));
        });

        socketRef.current.on("receive-message", ({ id, name, message }) => {
          setChatMessages((msgs) => [...msgs, { id, name, message }]);
        });

        socketRef.current.on("typing", ({ id, name }) => {
          setTypingUsers((prev) =>
            prev.find((user) => user.id === id) ? prev : [...prev, { id, name }]
          );
        });

        socketRef.current.on("stop-typing", ({ id }) => {
          setTypingUsers((prev) => prev.filter((user) => user.id !== id));
        });
      });

    return () => {
      socketRef.current?.disconnect();
      peersRef.current.forEach(({ peer }) => peer.destroy());
      setPeers([]);
    };
  }, [roomname, userName]);

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
    if (incomingSignal) peer.signal(incomingSignal);
    return peer;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socketRef.current.emit("send-message", { name: userName, message });
    setMessage("");
    socketRef.current.emit("stop-typing");
  };

  const toggleMic = () => {
    const audioTrack = userVideo.current?.srcObject?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = userVideo.current?.srcObject?.getVideoTracks()[0];
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
      peer.replaceTrack(screenTrackRef.current, originalTrack, userVideo.current.srcObject);
    });
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setIsScreenSharing(false);
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

  const endCall = () => {
    peersRef.current.forEach(({ peer }) => peer.destroy());
    socketRef.current?.disconnect();
    navigate("/dashboard");
  };

  const PeerVideo = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
      peer.on("stream", (stream) => {
        if (ref.current) ref.current.srcObject = stream;
      });
    }, [peer]);
    return (
      <video
        playsInline
        autoPlay
        ref={ref}
        className="bg-black rounded h-48 w-full object-cover"
      />
    );
  };

  return (
    <div className="flex h-screen">
      {/* -------- Video Grid -------- */}
      <div className="w-3/4 bg-black p-2 grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto">
        <video
          muted
          ref={userVideo}
          autoPlay
          playsInline
          className="bg-black rounded h-48"
        />
        {peers.map(({ peerID, peer }) => (
          <PeerVideo key={peerID} peer={peer} />
        ))}
      </div>

      {/* -------- Chat Section -------- */}
      <div className="w-1/4 flex flex-col border-l border-gray-400 bg-gray-50">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatMessages.map((msg, idx) => (
            <div
              key={`${msg.id}-${idx}`}
              className={`rounded-full p-4 text-sm ${
                msg.id === socketId ? "bg-gray-300 font-bold" : "bg-white"
              }`}
            >
              <strong>{msg.name || "Unknown"}:</strong> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            {typingUsers.map((u) => u.name).join(", ")} typing...
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex p-2 border-t border-gray-300">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>

        {/* Controls */}
        <div className="flex justify-around items-center p-3 border-t bg-gray-100">
          <button onClick={toggleMic} className="text-gray-700">
            <FontAwesomeIcon icon={isMicOn ? faMicrophone : faMicrophoneSlash} size="lg" />
          </button>
          <button onClick={toggleCamera} className="text-gray-700">
            <FontAwesomeIcon icon={isCameraOn ? faVideo : faVideoSlash} size="lg" />
          </button>
          <button onClick={toggleScreenShare} className="text-gray-700">
            <FontAwesomeIcon icon={faDesktop} size="lg" />
          </button>
          <button
            onClick={endCall}
            className="text-red-600 hover:text-red-800"
            title="End Call"
          >
            <FontAwesomeIcon icon={faPhoneSlash} size="lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Room({ roomname, userName }) {
  const [peers, setPeers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketId, setSocketId] = useState(null);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const messagesEndRef = useRef();
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => setSocketId(socketRef.current.id));

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
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
        const peerObj = peersRef.current.find((p) => p.peerID === data.from);
        if (peerObj) {
          peerObj.peer.signal(data.signal);
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
    if (incomingSignal) peer.signal(incomingSignal);
    return peer;
  };

  const PeerVideo = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
      peer.on("stream", (stream) => {
        if (ref.current) ref.current.srcObject = stream;
      });
    }, [peer]);
    return <video playsInline autoPlay ref={ref} className="h-48 w-full bg-black rounded" />;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socketRef.current.emit("send-message", { name: userName, message });
    setMessage("");
    socketRef.current.emit("stop-typing");
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

  return (
    <div className="flex h-screen">
      {/* Video Grid */}
      <div className="w-3/4 bg-black p-2 grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto">
        <video muted ref={userVideo} autoPlay playsInline className="h-48 w-full bg-black rounded" />
        {peers.map(({ peerID, peer }) => (
          <PeerVideo key={peerID} peer={peer} />
        ))}
      </div>

      {/* Chat Section */}
      <div className="w-1/4 flex flex-col border-l border-gray-400 bg-gray-50">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatMessages.map((msg, idx) => (
            <div key={`${msg.id}-${idx}`} className={`rounded-full p-4 text-sm ${msg.id === socketId ? "bg-gray-300 font-bold" : "bg-white"}`}>
              <strong>{msg.name || "Unknown"}:</strong> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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
            onBlur={() => socketRef.current.emit("stop-typing")}
            placeholder="Type message..."
            className="w-full px-3 py-2 border border-gray-400 rounded outline-none"
          />
        </form>

        <button onClick={endCall} className="bg-red-500 text-white p-2 m-2 rounded">
          End Call
        </button>
      </div>
    </div>
  );
}

export default Room;

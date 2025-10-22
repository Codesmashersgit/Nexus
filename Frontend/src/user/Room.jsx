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

const SERVER_URL = import.meta.env.CLIENT_URL || "http://localhost:5173";

function Room({ roomname, userName }) {
  const [peers, setPeers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const messagesEndRef = useRef();
  const screenTrackRef = useRef();
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    // User joined
    socketRef.current.on("user-joined", (userId) => {
      const peer = createPeer(userId, socketRef.current.id, userVideo.current.srcObject);
      peersRef.current.push({ peerID: userId, peer });
      setPeers((users) => [...users, peer]);
    });

    // Signal received
    socketRef.current.on("signal", (data) => {
      const item = peersRef.current.find((p) => p.peerID === data.from);
      if (item) {
        item.peer.signal(data.signal);
      } else {
        const peer = addPeer(data.signal, data.from, userVideo.current.srcObject);
        peersRef.current.push({ peerID: data.from, peer });
        setPeers((users) => [...users, peer]);
      }
    });

    // User left
    socketRef.current.on("user-left", (userId) => {
      const peerObj = peersRef.current.find((p) => p.peerID === userId);
      if (peerObj) peerObj.peer.destroy();
      peersRef.current = peersRef.current.filter((p) => p.peerID !== userId);
      setPeers(peersRef.current.map((p) => p.peer));
    });

    // Receive chat message
    socketRef.current.on("receive-message", ({ id, name, message }) => {
      setChatMessages((messages) => [...messages, { id, name, message }]);
    });

    // Typing indicators
    socketRef.current.on("typing", ({ id, name }) => {
      setTypingUsers((prev) => {
        if (prev.find((user) => user.id === id)) return prev;
        return [...prev, { id, name }];
      });
    });

    socketRef.current.on("stop-typing", ({ id }) => {
      setTypingUsers((prev) => prev.filter((user) => user.id !== id));
    });

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join-room", roomname);
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
        alert("Cannot access camera/microphone. Please allow permission.");
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("user-joined");
        socketRef.current.off("signal");
        socketRef.current.off("user-left");
        socketRef.current.off("receive-message");
        socketRef.current.off("typing");
        socketRef.current.off("stop-typing");
        socketRef.current.disconnect();
      }
      peersRef.current.forEach((p) => p.peer.destroy());
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
    if (message.trim() === "") return;
    socketRef.current.emit("send-message", { name: userName, message });
    setMessage("");
    socketRef.current.emit("stop-typing");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleMic = () => {
    const audioTrack = userVideo.current.srcObject.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = userVideo.current.srcObject.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOn(videoTrack.enabled);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          peersRef.current.forEach(({ peer }) => {
            const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
            if (sender) sender.replaceTrack(userVideo.current.srcObject.getVideoTracks()[0]);
          });
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        setIsScreenSharing(false);
      }
    }
  };

  const endCall = () => {
    peersRef.current.forEach((p) => p.peer.destroy());
    socketRef.current.disconnect();
    window.location.href = "/dashboard";
  };

  // Typing input handler with throttle + debounce
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    const now = Date.now();
    if (now - lastTypingTime.current > 300) {
      socketRef.current.emit("typing", { name: userName });
      lastTypingTime.current = now;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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
      <div className="md:w-1/4 hidden w-full border-t md:border-t-0 md:border-l border-gray-400 lg:flex md:h-full">
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {chatMessages.map((msg, idx) => (
            <div
              key={`${msg.id}-${idx}`}
              className={`rounded-full p-4 text-sm break-words ${
                msg.id === socketRef.current.id ? "bg-gray-300 font-bold" : "bg-white"
              }`}
            >
              <strong>
                {msg.name || (msg.id === socketRef.current.id ? "You" : "Unknown")}:
              </strong>{" "}
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
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    };
    peer.on("stream", handleStream);

    return () => {
      peer.off("stream", handleStream);
    };
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

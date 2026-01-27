import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const RTCContext = createContext();
export const useRTC = () => useContext(RTCContext);

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const RTCProvider = ({ children }) => {
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // key: userId, value: MediaStream
  const [messages, setMessages] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: { peer, dataChannel } }
  const streamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ]
  };

  const addMsg = useCallback((msg, sender) => {
    setMessages(prev => [...prev, { sender, msg, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  const createPeer = useCallback((userId, stream, isInitiator = false) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // ICE candidates
    pc.onicecandidate = e => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", { candidate: e.candidate, to: userId });
      }
    };

    // Remote tracks
    pc.ontrack = e => {
      console.log("Receiving remote track from", userId);
      setRemoteStreams(prev => ({ ...prev, [userId]: e.streams[0] }));
    };

    // Data channel
    let dataChannel;
    const setupDataChannel = (dc) => {
      dc.onopen = () => console.log("Data channel open for", userId);
      dc.onmessage = e => addMsg(e.data, userId);
      dc.onclose = () => console.log("Data channel closed for", userId);
    };

    if (isInitiator) {
      dataChannel = pc.createDataChannel("chat");
      setupDataChannel(dataChannel);
    } else {
      pc.ondatachannel = e => {
        dataChannel = e.channel;
        setupDataChannel(dataChannel);
        peersRef.current[userId].dataChannel = dataChannel;
      };
    }

    peersRef.current[userId] = { peer: pc, dataChannel };
    return pc;
  }, [addMsg]);

  const startRoom = useCallback(async (roomId) => {
    try {
      if (socketRef.current) socketRef.current.disconnect();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      streamRef.current = stream;

      socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
        socketRef.current.emit("join-room", roomId);
      });

      // When we join, the server tells us who is already there
      socketRef.current.on("all-users", async (users) => {
        console.log("Existing users in room:", users);
        for (let userId of users) {
          const pc = createPeer(userId, stream, true);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("offer", { offer, to: userId });
        }
      });

      // When someone else joins after us and sends an offer
      socketRef.current.on("offer", async (payload) => {
        console.log("Received offer from", payload.from);
        const pc = createPeer(payload.from, stream, false);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("answer", { answer, to: payload.from });
      });

      socketRef.current.on("answer", async (payload) => {
        console.log("Received answer from", payload.from);
        const peerObj = peersRef.current[payload.from];
        if (peerObj) {
          await peerObj.peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      });

      socketRef.current.on("ice-candidate", async (payload) => {
        const peerObj = peersRef.current[payload.from];
        if (peerObj) {
          await peerObj.peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      });

      socketRef.current.on("user-left", (userId) => {
        console.log("User left:", userId);
        const peerObj = peersRef.current[userId];
        if (peerObj) {
          peerObj.peer.close();
          delete peersRef.current[userId];
        }
        setRemoteStreams(prev => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      });

    } catch (err) {
      console.error("Failed to start room:", err);
      setError(err.message);
    }
  }, [createPeer]);

  const sendChatMessage = useCallback((text) => {
    let sent = false;
    Object.values(peersRef.current).forEach(({ dataChannel }) => {
      if (dataChannel?.readyState === "open") {
        dataChannel.send(text);
        sent = true;
      }
    });
    if (sent || Object.keys(peersRef.current).length === 0) {
      addMsg(text, "Me");
    }
  }, [addMsg]);

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  const endCall = useCallback(() => {
    Object.values(peersRef.current).forEach(({ peer, dataChannel }) => {
      peer.close();
      dataChannel?.close();
    });
    streamRef.current?.getTracks().forEach(t => t.stop());
    peersRef.current = {};
    setLocalStream(null);
    setRemoteStreams({});
    setMessages([]);
    if (socketRef.current) socketRef.current.disconnect();
    navigate("/dashboard");
  }, [navigate]);

  return (
    <RTCContext.Provider value={{
      localStream,
      remoteStreams,
      messages,
      isMicOn,
      isCameraOn,
      error,
      startRoom,
      sendChatMessage,
      toggleMic,
      toggleCamera,
      endCall
    }}>
      {children}
    </RTCContext.Provider>
  );
};

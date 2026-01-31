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
  const [remoteUsers, setRemoteUsers] = useState({}); // key: userId, value: { name }
  const [messages, setMessages] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: { peer, dataChannel } }
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ]
  };

  const addMsg = useCallback((msg, sender, type = "text", metadata = {}) => {
    setMessages(prev => [...prev, {
      sender,
      msg,
      type,
      metadata,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
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
      dc.onmessage = e => {
        try {
          const data = JSON.parse(e.data);
          addMsg(data.msg, data.sender || userId, data.type, data.metadata);
        } catch (err) {
          addMsg(e.data, userId);
        }
      };
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
        const name = localStorage.getItem("username") || "Anonymous";
        socketRef.current.emit("join-room", { roomId, name });
      });

      // When we join, the server tells us who is already there
      socketRef.current.on("all-users", async (users) => {
        console.log("Existing users in room:", users);
        setRemoteUsers(prev => {
          const next = { ...prev };
          users.forEach(u => { next[u.id] = { name: u.name }; });
          return next;
        });
        for (let user of users) {
          const pc = createPeer(user.id, stream, true);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("offer", { offer, to: user.id });
        }
      });

      // When someone else joins after us
      socketRef.current.on("user-joined", (user) => {
        console.log("User joined:", user);
        setRemoteUsers(prev => ({ ...prev, [user.id]: { name: user.name } }));
      });

      // When someone else joins after us and sends an offer
      socketRef.current.on("offer", async (payload) => {
        console.log("Received offer from", payload.from);
        const pc = createPeer(payload.from, stream, false);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));

        // Process queued candidates that might have arrived before offer processing finished
        const peerObj = peersRef.current[payload.from];
        if (peerObj && peerObj.candidateQueue) {
          peerObj.candidateQueue.forEach(candidate => {
            peerObj.peer.addIceCandidate(new RTCIceCandidate(candidate));
          });
          peerObj.candidateQueue = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("answer", { answer, to: payload.from });
      });

      socketRef.current.on("answer", async (payload) => {
        console.log("Received answer from", payload.from);
        const peerObj = peersRef.current[payload.from];
        if (peerObj) {
          await peerObj.peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
          // Process queued candidates
          if (peerObj.candidateQueue) {
            peerObj.candidateQueue.forEach(candidate => {
              peerObj.peer.addIceCandidate(new RTCIceCandidate(candidate));
            });
            peerObj.candidateQueue = [];
          }
        }
      });

      socketRef.current.on("ice-candidate", async (payload) => {
        const peerObj = peersRef.current[payload.from];
        if (peerObj) {
          if (peerObj.peer.remoteDescription) {
            await peerObj.peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } else {
            // Queue candidate if remote description is not set yet
            if (!peerObj.candidateQueue) peerObj.candidateQueue = [];
            peerObj.candidateQueue.push(payload.candidate);
          }
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
    const name = localStorage.getItem("username") || "Me";
    const payload = JSON.stringify({ msg: text, sender: name, type: "text" });

    let sent = false;
    Object.values(peersRef.current).forEach(({ dataChannel }) => {
      if (dataChannel?.readyState === "open") {
        dataChannel.send(payload);
        sent = true;
      }
    });
    addMsg(text, "Me", "text");
  }, [addMsg]);

  const sendMedia = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const name = localStorage.getItem("username") || "Me";

      let type = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      const payload = JSON.stringify({
        msg: file.name,
        sender: name,
        type,
        metadata: {
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: base64
        }
      });

      Object.values(peersRef.current).forEach(({ dataChannel }) => {
        if (dataChannel?.readyState === "open") {
          dataChannel.send(payload);
        }
      });
      addMsg(file.name, "Me", type, { data: base64, name: file.name });
    };
    reader.readAsDataURL(file);
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

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and revert to camera
        const videoTrack = screenStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) videoTrack.stop();
        screenStreamRef.current = null;

        // Re-enable camera stream
        const cameraTrack = streamRef.current.getVideoTracks()[0];
        if (cameraTrack) {
          Object.values(peersRef.current).forEach(({ peer }) => {
            const sender = peer.getSenders().find(s => s.track?.kind === "video");
            if (sender && cameraTrack) sender.replaceTrack(cameraTrack);
          });
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];

        Object.values(peersRef.current).forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track?.kind === "video");
          if (sender && screenTrack) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };

        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error("Screen share error:", err);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

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
      remoteUsers,
      messages,
      isMicOn,
      isCameraOn,
      isScreenSharing,
      error,
      startRoom,
      sendChatMessage,
      sendMedia,
      toggleMic,
      toggleCamera,
      toggleScreenShare,
      endCall
    }}>
      {children}
    </RTCContext.Provider>
  );
};

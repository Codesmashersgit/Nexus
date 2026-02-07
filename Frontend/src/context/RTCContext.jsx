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
  const [screenSharingId, setScreenSharingId] = useState(null); // 'me' or userId or null
  const [remoteCameraStatus, setRemoteCameraStatus] = useState({}); // key: userId, value: boolean
  const [networkMetrics, setNetworkMetrics] = useState({ rtt: 0, packetLoss: 0, jitter: 0 });
  const [remoteTyping, setRemoteTyping] = useState({}); // key: userId, value: { name, isTyping }
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: { peer, dataChannel } }
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingCandidates = useRef({});
  const incomingFiles = useRef({}); // { [fileId]: { chunks: [], meta: {} } }

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      // Add TURN for strict firewalls/NAT
      { urls: "turn:turn.anyfirewall.com:443?transport=tcp", username: "webrtc", credential: "webrtc" }
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
      dc.onopen = () => {
        console.log("Data channel open for", userId);
        // If we are initiator, we can send our status immediately
        if (isInitiator) {
          dc.send(JSON.stringify({ type: "system", action: "camera-status", enabled: streamRef.current.getVideoTracks()[0]?.enabled }));
        }
      };
      dc.onmessage = e => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === "system") {
            if (data.action === "screen-share-start") {
              setScreenSharingId(userId);
            } else if (data.action === "screen-share-stop") {
              setScreenSharingId(null);
            } else if (data.action === "camera-status") {
              setRemoteCameraStatus(prev => ({ ...prev, [userId]: data.enabled }));
            } else if (data.action === "typing-start") {
              setRemoteTyping(prev => ({ ...prev, [userId]: { name: data.name, isTyping: true } }));
            } else if (data.action === "typing-stop") {
              setRemoteTyping(prev => ({ ...prev, [userId]: { name: data.name, isTyping: false } }));
            }
          }
          // Handle File Chunking Protocol
          else if (data.type === "file-meta") {
            incomingFiles.current[data.fileId] = {
              chunks: [],
              meta: data.metadata,
              sender: data.sender || userId
            };
          }
          else if (data.type === "file-chunk") {
            const file = incomingFiles.current[data.fileId];
            if (file) {
              file.chunks.push(data.chunk);
            }
          }
          else if (data.type === "file-end") {
            const file = incomingFiles.current[data.fileId];
            if (file) {
              const fullData = file.chunks.join("");
              addMsg(file.meta.name, file.sender, file.meta.type, { ...file.meta, data: fullData });
              delete incomingFiles.current[data.fileId];
            }
          }
          // Handle Normal Text Messages
          else {
            addMsg(data.msg, data.sender || userId, data.type, data.metadata);
          }
        } catch (err) {
          console.error("Data channel message error:", err);
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

        // Send current camera status to the user who joined
        setTimeout(() => {
          if (dataChannel.readyState === "open") {
            dataChannel.send(JSON.stringify({ type: "system", action: "camera-status", enabled: streamRef.current.getVideoTracks()[0]?.enabled }));
          }
        }, 500);
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
        // Initial broadcast of camera status will happen when peers are created
      });

      socketRef.current.on("room-full", (data) => {
        console.warn("Room is full:", data.message);
        setError("Room is full");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setLocalStream(null);
      });

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

          // Send current camera status to the new user once DC is open
          // This is handled in setupDataChannel by checking if it's initiator
        }
      });

      socketRef.current.on("user-joined", (user) => {
        console.log("User joined:", user);
        setRemoteUsers(prev => ({ ...prev, [user.id]: { name: user.name } }));
      });

      socketRef.current.on("offer", async (payload) => {
        console.log("Received offer from", payload.from);
        const pc = createPeer(payload.from, stream, false);

        // 1. Check for pending candidates (arrived before offer)
        if (pendingCandidates.current[payload.from]) {
          pendingCandidates.current[payload.from].forEach(candidate => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
          delete pendingCandidates.current[payload.from];
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));

        const peerObj = peersRef.current[payload.from];
        // 2. Check for candidates queued on the peer object (arrived during setRemoteDescription)
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
            if (!peerObj.candidateQueue) peerObj.candidateQueue = [];
            peerObj.candidateQueue.push(payload.candidate);
          }
        } else {
          // Peer doesn't exist yet (Offer hasn't arrived) - queue globally
          if (!pendingCandidates.current[payload.from]) {
            pendingCandidates.current[payload.from] = [];
          }
          pendingCandidates.current[payload.from].push(payload.candidate);
        }
      });

      socketRef.current.on("user-left", (userId) => {
        console.log("User left:", userId);
        const peerObj = peersRef.current[userId];
        if (peerObj) {
          peerObj.peer.close();
          delete peersRef.current[userId];
        }
        if (pendingCandidates.current[userId]) {
          delete pendingCandidates.current[userId];
        }
        setRemoteStreams(prev => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
        // If the sharing user left, reset state
        setScreenSharingId(prev => (prev === userId ? null : prev));
        setRemoteCameraStatus(prev => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
        setRemoteTyping(prev => {
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
      const fileId = crypto.randomUUID();
      const CHUNK_SIZE = 16 * 1024; // 16KB

      let type = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      const metadata = {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        type: type
      };

      // 1. Send Metadata
      const metaMsg = JSON.stringify({
        type: "file-meta",
        fileId,
        sender: name,
        metadata
      });

      Object.values(peersRef.current).forEach(({ dataChannel }) => {
        if (dataChannel?.readyState === "open") dataChannel.send(metaMsg);
      });

      // 2. Send Chunks
      const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkMsg = JSON.stringify({
          type: "file-chunk",
          fileId,
          chunk
        });

        Object.values(peersRef.current).forEach(({ dataChannel }) => {
          if (dataChannel?.readyState === "open") dataChannel.send(chunkMsg);
        });
      }

      // 3. Send End Signal
      const endMsg = JSON.stringify({
        type: "file-end",
        fileId
      });

      Object.values(peersRef.current).forEach(({ dataChannel }) => {
        if (dataChannel?.readyState === "open") dataChannel.send(endMsg);
      });

      // Add to local chat immediately
      addMsg(file.name, "Me", type, { ...metadata, data: base64 });
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

        // Notify peers
        const sysMsg = JSON.stringify({ type: "system", action: "camera-status", enabled: videoTrack.enabled });
        Object.values(peersRef.current).forEach(({ dataChannel }) => {
          if (dataChannel?.readyState === "open") dataChannel.send(sysMsg);
        });
      }
    }
  }, []);

  const sendTypingStatus = useCallback((isTyping) => {
    const name = localStorage.getItem("username") || "Me";
    const sysMsg = JSON.stringify({
      type: "system",
      action: isTyping ? "typing-start" : "typing-stop",
      name
    });
    Object.values(peersRef.current).forEach(({ dataChannel }) => {
      if (dataChannel?.readyState === "open") dataChannel.send(sysMsg);
    });
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

        // Notify peers
        const sysMsg = JSON.stringify({ type: "system", action: "screen-share-stop" });
        Object.values(peersRef.current).forEach(({ dataChannel }) => {
          if (dataChannel?.readyState === "open") dataChannel.send(sysMsg);
        });

        // Revert local preview to Camera
        setLocalStream(streamRef.current);
        setScreenSharingId(null);
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
          // If user clicks "Stop Sharing" in browser UI
          if (screenStreamRef.current) {
            // We need to manually invoke the stop logic logic here
            const cameraTrack = streamRef.current.getVideoTracks()[0];
            if (cameraTrack) {
              Object.values(peersRef.current).forEach(({ peer }) => {
                const sender = peer.getSenders().find(s => s.track?.kind === "video");
                if (sender && cameraTrack) sender.replaceTrack(cameraTrack);
              });
            }
            // Notify peers
            const sysMsg = JSON.stringify({ type: "system", action: "screen-share-stop" });
            Object.values(peersRef.current).forEach(({ dataChannel }) => {
              if (dataChannel?.readyState === "open") dataChannel.send(sysMsg);
            });

            setLocalStream(streamRef.current);
            setScreenSharingId(null);
            setIsScreenSharing(false);
            screenStreamRef.current = null;
          }
        };

        // Notify peers
        const sysMsg = JSON.stringify({ type: "system", action: "screen-share-start" });
        Object.values(peersRef.current).forEach(({ dataChannel }) => {
          if (dataChannel?.readyState === "open") dataChannel.send(sysMsg);
        });

        // Set local preview to ScreenShare
        setLocalStream(screenStream);
        setScreenSharingId("me");
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error("Screen share error:", err);
      setIsScreenSharing(false);
      setScreenSharingId(null);
    }
  }, [isScreenSharing]);

  const adjustVideoQuality = useCallback(async (isPoor) => {
    Object.values(peersRef.current).forEach(async ({ peer }) => {
      const senders = peer.getSenders().filter(s => s.track?.kind === "video");
      for (const sender of senders) {
        try {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];

          if (isPoor) {
            // Reduce quality: lower resolution and framerate
            params.encodings[0].scaleResolutionDownBy = 2;
            params.encodings[0].maxFramerate = 15;
            console.log("Lowering video quality due to poor network");
          } else {
            // Restore quality
            params.encodings[0].scaleResolutionDownBy = 1;
            params.encodings[0].maxFramerate = 30;
            console.log("Restoring video quality due to improved network");
          }

          await sender.setParameters(params);
        } catch (err) {
          console.error("Error adjusting video quality:", err);
        }
      }
    });
  }, []);

  const monitorNetwork = useCallback(async () => {
    if (Object.keys(peersRef.current).length === 0) return;

    let totalRtt = 0;
    let totalLoss = 0;
    let totalJitter = 0;
    let peerCount = 0;

    for (const { peer } of Object.values(peersRef.current)) {
      if (peer.connectionState !== "connected") continue;

      const stats = await peer.getStats();
      stats.forEach(report => {
        if (report.type === "remote-inbound-rtp" && report.kind === "video") {
          totalRtt += (report.roundTripTime || 0) * 1000; // ms
          totalJitter += (report.jitter || 0) * 1000; // ms
          peerCount++;
        }
        if (report.type === "inbound-rtp" && report.kind === "video") {
          const loss = (report.packetsLost / (report.packetsReceived + report.packetsLost)) * 100 || 0;
          totalLoss += loss;
        }
      });
    }

    if (peerCount > 0) {
      const avgRtt = totalRtt / peerCount;
      const avgLoss = totalLoss / peerCount;
      const avgJitter = totalJitter / peerCount;

      setNetworkMetrics({ rtt: avgRtt, packetLoss: avgLoss, jitter: avgJitter });

      // Thresholds: RTT > 300ms, Loss > 5%, Jitter > 30ms
      if (avgRtt > 300 || avgLoss > 5 || avgJitter > 30) {
        adjustVideoQuality(true);
      } else if (avgRtt < 150 && avgLoss < 2 && avgJitter < 15) {
        adjustVideoQuality(false);
      }
    }
  }, [adjustVideoQuality]);

  // Network Monitoring Effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      monitorNetwork();
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [monitorNetwork]);

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
    setScreenSharingId(null);
    setIsScreenSharing(false);
    if (socketRef.current) socketRef.current.disconnect();
    navigate("/dashboard");
  }, [navigate]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <RTCContext.Provider value={{
      localStream,
      remoteStreams,
      remoteUsers,
      remoteCameraStatus, // Exported
      screenSharingId, // Exported
      messages,
      isMicOn,
      isCameraOn,
      isScreenSharing,
      networkMetrics,
      remoteTyping,
      error,
      startRoom,
      sendChatMessage,
      sendMedia,
      sendTypingStatus,
      toggleMic,
      toggleCamera,
      toggleScreenShare,
      endCall
    }}>
      {children}
    </RTCContext.Provider>
  );
};

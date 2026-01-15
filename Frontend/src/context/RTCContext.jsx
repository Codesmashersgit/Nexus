// import React, { createContext, useContext, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//     createPeerConnection,
//     createDataChannel,
//     addLocalStream,
//     createOffer,
//     createAnswer,
//     setRemoteDescription,
//     addIceCandidate,
//     closePeerConnection
// } from "../rtc/peer";

// import {
//     initSocket,
//     joinRoom,
//     sendOffer,
//     sendAnswer,
//     sendIceCandidate,
//     disconnectSocket
// } from "../rtc/signaling";

// const RTCContext = createContext();
// export const useRTC = () => useContext(RTCContext);

// const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

// export const RTCProvider = ({ children }) => {
//     const navigate = useNavigate();

//     const [localStream, setLocalStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [connectedUser, setConnectedUser] = useState(null);

//     const peerRef = useRef(null);
//     const dataRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);

//     const alreadyJoinedRef = useRef(false);

//     // -----------------------------
//     // CONNECT SOCKET
//     // -----------------------------
//     const connectSocket = async () => {
//         const socket = await initSocket(SERVER_URL);

//         socket.on("connect", () => {
//             const room = localStorage.getItem("ACTIVE_ROOM");

//             if (room && !alreadyJoinedRef.current) {
//                 alreadyJoinedRef.current = true;
//                 joinRoomAuto(room);
//             }
//         });
//     };

//     // -----------------------------
//     // ROOM JOIN
//     // -----------------------------
//     const startRoom = async (roomId) => {
//         localStorage.setItem("ACTIVE_ROOM", roomId);
//         joinRoomAuto(roomId);
//     };

//     const joinRoomAuto = (roomId) => {
//         joinRoom(
//             roomId,

//             // USER JOINED
//             async (userId) => {
//                 setConnectedUser(userId);
//                 await startCall(userId);
//             },

//             // OFFER RECEIVED
//             async (offer, from) => {
//                 setConnectedUser(from);

//                 peerRef.current = createPeerConnection(
//                     (msg) => addMsg(msg, "R"),
//                     (stream) => {
//                         setRemoteStream(stream);
//                         if (remoteVideoRef.current)
//                             remoteVideoRef.current.srcObject = stream;
//                     },
//                     (candidate) => sendIceCandidate(candidate, from)
//                 );

//                 // Data channel for answerer:
//                 peerRef.current.ondatachannel = (event) => {
//                     dataRef.current = event.channel;
//                     dataRef.current.onmessage = (e) => addMsg(e.data, "R");
//                 };

//                 await setRemoteDescription(offer);

//                 const answer = await createAnswer();
//                 sendAnswer(answer, from);
//             },

//             // ANSWER
//             async (answer) => {
//                 await setRemoteDescription(answer);
//             },

//             // ICE
//             async (candidate) => {
//                 await addIceCandidate(candidate);
//             },

//             // USER LEFT
//             () => {
//                 setRemoteStream(null);
//                 if (remoteVideoRef.current)
//                     remoteVideoRef.current.srcObject = null;

//                 peerRef.current?.close();
//                 dataRef.current?.close();
//                 peerRef.current = null;
//                 dataRef.current = null;
//                 setConnectedUser(null);
//             }
//         );
//     };

//     // -----------------------------
//     // START CALL (Offerer)
//     // -----------------------------
//     const startCall = async (userId) => {
//         peerRef.current = createPeerConnection(
//             (msg) => addMsg(msg, "R"),
//             (stream) => {
//                 setRemoteStream(stream);
//                 if (remoteVideoRef.current)
//                     remoteVideoRef.current.srcObject = stream;
//             },
//             (candidate) => sendIceCandidate(candidate, userId)
//         );

//         // Get local media
//         const stream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });

//         setLocalStream(stream);
//         if (localVideoRef.current)
//             localVideoRef.current.srcObject = stream;

//         await addLocalStream(stream);

//         // Offerer creates data channel
//         dataRef.current = createDataChannel((msg) => addMsg(msg, "R"));

//         const offer = await createOffer();
//         sendOffer(offer, userId);
//     };

//     // -----------------------------
//     // CHAT
//     // -----------------------------
//     const addMsg = (msg, sender) => {
//         setMessages((p) => [...p, { sender, msg }]);
//     };

//     const sendChatMessage = (text) => {
//         if (!dataRef.current || dataRef.current.readyState !== "open") return;
//         dataRef.current.send(text);
//         addMsg(text, "M");
//     };

//     // -----------------------------
//     // END CALL
//     // -----------------------------
//     const endCall = () => {
//         localStorage.removeItem("ACTIVE_ROOM");

//         disconnectSocket();

//         peerRef.current?.close();
//         dataRef.current?.close();
//         closePeerConnection();

//         localStream?.getTracks().forEach((t) => t.stop());
//         remoteStream?.getTracks().forEach((t) => t.stop());

//         setLocalStream(null);
//         setRemoteStream(null);

//         navigate("/dashboard");
//     };

//     return (
//         <RTCContext.Provider value={{
//             localStream,
//             remoteStream,
//             messages,
//             connectedUser,
//             connectSocket,
//             startRoom,
//             sendChatMessage,
//             endCall,
//             localVideoRef,
//             remoteVideoRef
//         }}>
//             {children}
//         </RTCContext.Provider>
//     );
// };


// import React, { createContext, useContext, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//     createPeerConnection,
//     createDataChannel,
//     addLocalStream,
//     createOffer,
//     createAnswer,
//     setRemoteDescription,
//     addIceCandidate,
//     closePeerConnection
// } from "../rtc/peer";

// import {
//     initSocket,
//     joinRoom,
//     sendOffer,
//     sendAnswer,
//     sendIceCandidate,
//     disconnectSocket
// } from "../rtc/signaling";

// const RTCContext = createContext();
// export const useRTC = () => useContext(RTCContext);

// const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

// export const RTCProvider = ({ children }) => {
//     const navigate = useNavigate();

//     const [localStream, setLocalStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [connectedUser, setConnectedUser] = useState(null);

//     const peerRef = useRef(null);
//     const dataRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);

//     const alreadyJoinedRef = useRef(false);

//     // -----------------------------
//     // CONNECT SOCKET
//     // -----------------------------
//     const connectSocket = async () => {
//         const socket = await initSocket(SERVER_URL);

//         socket.on("connect", () => {
//             const room = localStorage.getItem("ACTIVE_ROOM");

//             if (room && !alreadyJoinedRef.current) {
//                 alreadyJoinedRef.current = true;
//                 joinRoomAuto(room);
//             }
//         });
//     };

//     // -----------------------------
//     // GET LOCAL MEDIA STREAM
//     // -----------------------------
//     const getLocalMediaStream = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });

//             setLocalStream(stream);
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = stream;
//             }

//             return stream;
//         } catch (error) {
//             console.error("Error getting local media:", error);
//             throw error;
//         }
//     };

//     // -----------------------------
//     // ROOM JOIN
//     // -----------------------------
//     const startRoom = async (roomId) => {
//         localStorage.setItem("ACTIVE_ROOM", roomId);
//         joinRoomAuto(roomId);
//     };

//     const joinRoomAuto = (roomId) => {
//         joinRoom(
//             roomId,

//             // USER JOINED - Main offerer banunga
//             async (userId) => {
//                 setConnectedUser(userId);
//                 await startCall(userId);
//             },

//             // OFFER RECEIVED - Main answerer banunga
//             async (offer, from) => {
//                 setConnectedUser(from);

//                 // Pehle apna local stream setup karo
//                 const stream = await getLocalMediaStream();

//                 // Peer connection banao
//                 peerRef.current = createPeerConnection(
//                     (msg) => addMsg(msg, "R"),
//                     (remoteStreamReceived) => {
//                         setRemoteStream(remoteStreamReceived);
//                         if (remoteVideoRef.current) {
//                             remoteVideoRef.current.srcObject = remoteStreamReceived;
//                         }
//                     },
//                     (candidate) => sendIceCandidate(candidate, from)
//                 );

//                 // Data channel setup for answerer
//                 peerRef.current.ondatachannel = (event) => {
//                     dataRef.current = event.channel;
//                     dataRef.current.onmessage = (e) => addMsg(e.data, "R");
//                 };

//                 // Apna local stream peer connection mein add karo
//                 await addLocalStream(stream);

//                 // Remote description set karo
//                 await setRemoteDescription(offer);

//                 // Answer create aur send karo
//                 const answer = await createAnswer();
//                 sendAnswer(answer, from);
//             },

//             // ANSWER RECEIVED
//             async (answer) => {
//                 await setRemoteDescription(answer);
//             },

//             // ICE CANDIDATE RECEIVED
//             async (candidate) => {
//                 await addIceCandidate(candidate);
//             },

//             // USER LEFT
//             () => {
//                 setRemoteStream(null);
//                 if (remoteVideoRef.current) {
//                     remoteVideoRef.current.srcObject = null;
//                 }

//                 peerRef.current?.close();
//                 dataRef.current?.close();
//                 peerRef.current = null;
//                 dataRef.current = null;
//                 setConnectedUser(null);
//             }
//         );
//     };

//     // -----------------------------
//     // START CALL (Offerer)
//     // -----------------------------
//     const startCall = async (userId) => {
//         // Peer connection banao
//         peerRef.current = createPeerConnection(
//             (msg) => addMsg(msg, "R"),
//             (remoteStreamReceived) => {
//                 setRemoteStream(remoteStreamReceived);
//                 if (remoteVideoRef.current) {
//                     remoteVideoRef.current.srcObject = remoteStreamReceived;
//                 }
//             },
//             (candidate) => sendIceCandidate(candidate, userId)
//         );

//         // Local media stream get karo
//         const stream = await getLocalMediaStream();

//         // Local stream peer connection mein add karo
//         await addLocalStream(stream);

//         // Data channel create karo (offerer creates it)
//         dataRef.current = createDataChannel((msg) => addMsg(msg, "R"));

//         // Offer create aur send karo
//         const offer = await createOffer();
//         sendOffer(offer, userId);
//     };

//     // -----------------------------
//     // CHAT
//     // -----------------------------
//     const addMsg = (msg, sender) => {
//         setMessages((prev) => [...prev, { sender, msg }]);
//     };

//     const sendChatMessage = (text) => {
//         if (!dataRef.current || dataRef.current.readyState !== "open") {
//             console.warn("Data channel not ready");
//             return;
//         }
//         dataRef.current.send(text);
//         addMsg(text, "M");
//     };

//     // -----------------------------
//     // END CALL
//     // -----------------------------
//     const endCall = () => {
//         localStorage.removeItem("ACTIVE_ROOM");

//         disconnectSocket();

//         peerRef.current?.close();
//         dataRef.current?.close();
//         closePeerConnection();

//         localStream?.getTracks().forEach((track) => track.stop());
//         remoteStream?.getTracks().forEach((track) => track.stop());

//         setLocalStream(null);
//         setRemoteStream(null);
//         setMessages([]);
//         setConnectedUser(null);

//         alreadyJoinedRef.current = false;

//         navigate("/dashboard");
//     };

//     return (
//         <RTCContext.Provider value={{
//             localStream,
//             remoteStream,
//             messages,
//             connectedUser,
//             connectSocket,
//             startRoom,
//             sendChatMessage,
//             endCall,
//             localVideoRef,
//             remoteVideoRef
//         }}>
//             {children}
//         </RTCContext.Provider>
//     );
// };




import React, { createContext, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as Peer from "../rtc/peer";
import * as Signaling from "../rtc/signaling";

const RTCContext = createContext();
export const useRTC = () => useContext(RTCContext);

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

export const RTCProvider = ({ children }) => {
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectedUser, setConnectedUser] = useState(null);

  const peerRef = useRef(null);
  const dataRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const alreadyJoinedRef = useRef(false);

  // ----------------- SOCKET -----------------
  const connectSocket = async () => {
    await Signaling.initSocket(SERVER_URL);
    const room = localStorage.getItem("ACTIVE_ROOM");
    if (room && !alreadyJoinedRef.current) {
      alreadyJoinedRef.current = true;
      joinRoomAuto(room);
    }
  };

  // ----------------- MEDIA -----------------
  const getLocalMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  // ----------------- ROOM -----------------
  const startRoom = async (roomId) => {
    localStorage.setItem("ACTIVE_ROOM", roomId);
    joinRoomAuto(roomId);
  };

  const joinRoomAuto = (roomId) => {
    Signaling.joinRoom(
      roomId,
      async (userId) => {
        setConnectedUser(userId);
        await startCall(userId);
      },
      async (offer, from) => {
        setConnectedUser(from);
        const stream = await getLocalMediaStream();

        peerRef.current = Peer.createPeerConnection(
          (msg) => addMsg(msg, "R"),
          (remote) => {
            setRemoteStream(remote);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
          },
          (candidate) => Signaling.sendIceCandidate(candidate, from)
        );

        peerRef.current.addLocalStream(stream);

        peerRef.current.peerConnection.ondatachannel = (event) => {
          dataRef.current = event.channel;
          dataRef.current.onmessage = (e) => addMsg(e.data, "R");
        };

        await peerRef.current.setRemoteDescription(offer);
        const answer = await peerRef.current.createAnswer();
        Signaling.sendAnswer(answer, from);
      },
      async (answer) => {
        await peerRef.current.setRemoteDescription(answer);
      },
      async (candidate) => {
        await peerRef.current.addIceCandidate(candidate);
      },
      () => endCall()
    );
  };

  // ----------------- CALL -----------------
  const startCall = async (userId) => {
    const stream = await getLocalMediaStream();

    peerRef.current = Peer.createPeerConnection(
      (msg) => addMsg(msg, "R"),
      (remote) => {
        setRemoteStream(remote);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      },
      (candidate) => Signaling.sendIceCandidate(candidate, userId)
    );

    peerRef.current.addLocalStream(stream);
    dataRef.current = peerRef.current.createDataChannel((msg) => addMsg(msg, "R"));
    const offer = await peerRef.current.createOffer();
    Signaling.sendOffer(offer, userId);
  };

  // ----------------- CHAT -----------------
  const addMsg = (msg, sender) => setMessages((prev) => [...prev, { sender, msg }]);
  const sendChatMessage = (text) => {
    if (dataRef.current?.readyState === "open") {
      dataRef.current.send(text);
      addMsg(text, "M");
    } else console.warn("Data channel not ready");
  };

  // ----------------- END CALL -----------------
  const endCall = () => {
    localStorage.removeItem("ACTIVE_ROOM");
    Signaling.disconnectSocket();
    peerRef.current?.closePeerConnection();
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setMessages([]);
    setConnectedUser(null);
    alreadyJoinedRef.current = false;

    navigate("/dashboard");
  };

  return (
    <RTCContext.Provider
      value={{
        localStream,
        remoteStream,
        messages,
        connectedUser,
        connectSocket,
        startRoom,
        sendChatMessage,
        endCall,
        localVideoRef,
        remoteVideoRef,
      }}
    >
      {children}
    </RTCContext.Provider>
  );
};

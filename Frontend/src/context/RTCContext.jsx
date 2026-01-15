import React, { createContext, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    createPeerConnection,
    createDataChannel,
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closePeerConnection
} from "../rtc/peer";

import {
    initSocket,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    disconnectSocket
} from "../rtc/signaling";

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

    // -----------------------------
    // CONNECT SOCKET
    // -----------------------------
    const connectSocket = async () => {
        const socket = await initSocket(SERVER_URL);

        socket.on("connect", () => {
            const room = localStorage.getItem("ACTIVE_ROOM");

            if (room && !alreadyJoinedRef.current) {
                alreadyJoinedRef.current = true;
                joinRoomAuto(room);
            }
        });
    };

    // -----------------------------
    // ROOM JOIN
    // -----------------------------
    const startRoom = async (roomId) => {
        localStorage.setItem("ACTIVE_ROOM", roomId);
        joinRoomAuto(roomId);
    };

    const joinRoomAuto = (roomId) => {
        joinRoom(
            roomId,

            // USER JOINED
            async (userId) => {
                setConnectedUser(userId);
                await startCall(userId);
            },

            // OFFER RECEIVED
            async (offer, from) => {
                setConnectedUser(from);

                peerRef.current = createPeerConnection(
                    (msg) => addMsg(msg, "R"),
                    (stream) => {
                        setRemoteStream(stream);
                        if (remoteVideoRef.current)
                            remoteVideoRef.current.srcObject = stream;
                    },
                    (candidate) => sendIceCandidate(candidate, from)
                );

                // Data channel for answerer:
                peerRef.current.ondatachannel = (event) => {
                    dataRef.current = event.channel;
                    dataRef.current.onmessage = (e) => addMsg(e.data, "R");
                };

                await setRemoteDescription(offer);

                const answer = await createAnswer();
                sendAnswer(answer, from);
            },

            // ANSWER
            async (answer) => {
                await setRemoteDescription(answer);
            },

            // ICE
            async (candidate) => {
                await addIceCandidate(candidate);
            },

            // USER LEFT
            () => {
                setRemoteStream(null);
                if (remoteVideoRef.current)
                    remoteVideoRef.current.srcObject = null;

                peerRef.current?.close();
                dataRef.current?.close();
                peerRef.current = null;
                dataRef.current = null;
                setConnectedUser(null);
            }
        );
    };

    // -----------------------------
    // START CALL (Offerer)
    // -----------------------------
    const startCall = async (userId) => {
        peerRef.current = createPeerConnection(
            (msg) => addMsg(msg, "R"),
            (stream) => {
                setRemoteStream(stream);
                if (remoteVideoRef.current)
                    remoteVideoRef.current.srcObject = stream;
            },
            (candidate) => sendIceCandidate(candidate, userId)
        );

        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        setLocalStream(stream);
        if (localVideoRef.current)
            localVideoRef.current.srcObject = stream;

        await addLocalStream(stream);

        // Offerer creates data channel
        dataRef.current = createDataChannel((msg) => addMsg(msg, "R"));

        const offer = await createOffer();
        sendOffer(offer, userId);
    };

    // -----------------------------
    // CHAT
    // -----------------------------
    const addMsg = (msg, sender) => {
        setMessages((p) => [...p, { sender, msg }]);
    };

    const sendChatMessage = (text) => {
        if (!dataRef.current || dataRef.current.readyState !== "open") return;
        dataRef.current.send(text);
        addMsg(text, "M");
    };

    // -----------------------------
    // END CALL
    // -----------------------------
    const endCall = () => {
        localStorage.removeItem("ACTIVE_ROOM");

        disconnectSocket();

        peerRef.current?.close();
        dataRef.current?.close();
        closePeerConnection();

        localStream?.getTracks().forEach((t) => t.stop());
        remoteStream?.getTracks().forEach((t) => t.stop());

        setLocalStream(null);
        setRemoteStream(null);

        navigate("/dashboard");
    };

    return (
        <RTCContext.Provider value={{
            localStream,
            remoteStream,
            messages,
            connectedUser,
            connectSocket,
            startRoom,
            sendChatMessage,
            endCall,
            localVideoRef,
            remoteVideoRef
        }}>
            {children}
        </RTCContext.Provider>
    );
};



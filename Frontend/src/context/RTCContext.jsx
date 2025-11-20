
import React, { createContext, useContext, useState, useRef } from "react";

import {
    createPeerConnection,
    createDataChannel,
    sendMessage as sendDataMessage,  
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate
} from "../rtc/peer";

import {
    initSocket,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate
} from "../rtc/signaling";

const RTCContext = createContext();
export const useRTC = () => useContext(RTCContext);
const SERVER_URL= import.meta.env.VITE_BACKEND_URL

export const RTCProvider = ({ children }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [connectedUser, setConnectedUser] = useState(null);

    const peerRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    let cameraStreamRef = useRef(null); // Store original camera stream for screen share revert

    const addMessage = (msg, sender = "R") => {
        setMessages((prev) => [...prev, { sender, msg }]);
    };

    const connectSocket = () => {
        initSocket(`${SERVER_URL}`);
    };

    const startRoom = async (roomId) => {
        joinRoom(
            roomId,

            async (userId) => {
                setConnectedUser(userId);
                await startCall(userId);
            },

            async (offer, fromUser) => {
                setConnectedUser(fromUser);

                peerRef.current = createPeerConnection(
                    (msg) => addMessage(msg, "R"),
                    (stream) => setRemoteStream(stream),
                    (candidate) => sendIceCandidate(candidate, fromUser)
                );

                await setRemoteDescription(offer);

                const answer = await createAnswer();
                sendAnswer(answer, fromUser);
            },

            async (answer) => {
                await setRemoteDescription(answer);
            },

            async (candidate) => {
                await addIceCandidate(candidate);
            },

            () => {
                setConnectedUser(null);
                setRemoteStream(null);
            }
        );
    };

    const startCall = async (userId) => {
        peerRef.current = createPeerConnection(
            (msg) => addMessage(msg, "R"),
            (stream) => setRemoteStream(stream),
            (candidate) => sendIceCandidate(candidate, userId)
        );

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        setLocalStream(stream);
        cameraStreamRef.current = stream; // Store original camera stream
        await addLocalStream(stream);

        createDataChannel((msg) => addMessage(msg, "R"));

        const offer = await createOffer();
        sendOffer(offer, userId);
    };

    const sendChatMessage = (msg) => {
        addMessage(msg, "M");
        sendDataMessage(msg);
    };

    const toggleMic = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        console.log("Mic:", audioTrack.enabled ? "ON" : "OFF");
    };

    const toggleCamera = () => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        console.log("Camera:", videoTrack.enabled ? "ON" : "OFF");
    };

    const startScreenShare = async () => {
        if (!localStream || !peerRef.current) return;
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            const sender = peerRef.current.getSenders().find(s => s.track.kind === "video");
            if (sender) sender.replaceTrack(screenTrack);

            localVideoRef.current.srcObject = screenStream;

            screenTrack.onended = () => {
                const camTrack = cameraStreamRef.current.getVideoTracks()[0];
                if (sender) sender.replaceTrack(camTrack);
                localVideoRef.current.srcObject = cameraStreamRef.current;
                console.log("Screen sharing OFF, back to camera");
            };

            console.log("Screen sharing ON");
        } catch (err) {
            console.error("Screen share error:", err);
        }
    };

    const endCall = () => {
        if (peerRef.current) peerRef.current.close();
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
        console.log("CALL ENDED");
        window.location.href = "/dashboard";
    };

    return (
        <RTCContext.Provider
            value={{
                localStream,
                remoteStream,
                connectedUser,
                messages,
                connectSocket,
                startRoom,
                sendChatMessage,
                toggleMic,
                toggleCamera,
                startScreenShare,
                endCall,
                localVideoRef,
                remoteVideoRef
            }}
        >
            {children}
        </RTCContext.Provider>
    );
};





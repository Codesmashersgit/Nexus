
// import React, { createContext, useContext, useState, useRef } from "react";

// import {
//     createPeerConnection,
//     createDataChannel,
//     sendMessage as sendDataMessage,  
//     addLocalStream,
//     createOffer,
//     createAnswer,
//     setRemoteDescription,
//     addIceCandidate
// } from "../rtc/peer";

// import {
//     initSocket,
//     joinRoom,
//     sendOffer,
//     sendAnswer,
//     sendIceCandidate
// } from "../rtc/signaling";

// const RTCContext = createContext();
// export const useRTC = () => useContext(RTCContext);
// const SERVER_URL= import.meta.env.VITE_BACKEND_URL

// export const RTCProvider = ({ children }) => {
//     const [localStream, setLocalStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [connectedUser, setConnectedUser] = useState(null);

//     const peerRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);

//     let cameraStreamRef = useRef(null); // Store original camera stream for screen share revert

//     const addMessage = (msg, sender = "R") => {
//         setMessages((prev) => [...prev, { sender, msg }]);
//     };

//     const connectSocket = () => {
//         initSocket(`${SERVER_URL}`);
//     };

//     const startRoom = async (roomId) => {
//         joinRoom(
//             roomId,

//             async (userId) => {
//                 setConnectedUser(userId);
//                 await startCall(userId);
//             },

//             async (offer, fromUser) => {
//                 setConnectedUser(fromUser);

//                 peerRef.current = createPeerConnection(
//                     (msg) => addMessage(msg, "R"),
//                     (stream) => setRemoteStream(stream),
//                     (candidate) => sendIceCandidate(candidate, fromUser)
//                 );

//                 await setRemoteDescription(offer);

//                 const answer = await createAnswer();
//                 sendAnswer(answer, fromUser);
//             },

//             async (answer) => {
//                 await setRemoteDescription(answer);
//             },

//             async (candidate) => {
//                 await addIceCandidate(candidate);
//             },

//             () => {
//                 setConnectedUser(null);
//                 setRemoteStream(null);
//             }
//         );
//     };

//     const startCall = async (userId) => {
//         peerRef.current = createPeerConnection(
//             (msg) => addMessage(msg, "R"),
//             (stream) => setRemoteStream(stream),
//             (candidate) => sendIceCandidate(candidate, userId)
//         );

//         const stream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });

//         setLocalStream(stream);
//         cameraStreamRef.current = stream; // Store original camera stream
//         await addLocalStream(stream);

//         createDataChannel((msg) => addMessage(msg, "R"));

//         const offer = await createOffer();
//         sendOffer(offer, userId);
//     };

//     const sendChatMessage = (msg) => {
//         addMessage(msg, "M");
//         sendDataMessage(msg);
//     };

//     const toggleMic = () => {
//         if (!localStream) return;
//         const audioTrack = localStream.getAudioTracks()[0];
//         audioTrack.enabled = !audioTrack.enabled;
//         console.log("Mic:", audioTrack.enabled ? "ON" : "OFF");
//     };

//     const toggleCamera = () => {
//         if (!localStream) return;
//         const videoTrack = localStream.getVideoTracks()[0];
//         videoTrack.enabled = !videoTrack.enabled;
//         console.log("Camera:", videoTrack.enabled ? "ON" : "OFF");
//     };

//     const startScreenShare = async () => {
//         if (!localStream || !peerRef.current) return;
//         try {
//             const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//             const screenTrack = screenStream.getVideoTracks()[0];

//             const sender = peerRef.current.getSenders().find(s => s.track.kind === "video");
//             if (sender) sender.replaceTrack(screenTrack);

//             localVideoRef.current.srcObject = screenStream;

//             screenTrack.onended = () => {
//                 const camTrack = cameraStreamRef.current.getVideoTracks()[0];
//                 if (sender) sender.replaceTrack(camTrack);
//                 localVideoRef.current.srcObject = cameraStreamRef.current;
//                 console.log("Screen sharing OFF, back to camera");
//             };

//             console.log("Screen sharing ON");
//         } catch (err) {
//             console.error("Screen share error:", err);
//         }
//     };

//     const endCall = () => {
//         if (peerRef.current) peerRef.current.close();
//         if (localStream) localStream.getTracks().forEach(t => t.stop());
//         if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
//         console.log("CALL ENDED");
//         window.location.href = "/dashboard";
//     };

//     return (
//         <RTCContext.Provider
//             value={{
//                 localStream,
//                 remoteStream,
//                 connectedUser,
//                 messages,
//                 connectSocket,
//                 startRoom,
//                 sendChatMessage,
//                 toggleMic,
//                 toggleCamera,
//                 startScreenShare,
//                 endCall,
//                 localVideoRef,
//                 remoteVideoRef
//             }}
//         >
//             {children}
//         </RTCContext.Provider>
//     );
// };




import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
    createPeerConnection,
    createDataChannel,
    sendMessage as sendDataMessage,  
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
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [connectedUser, setConnectedUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    const peerRef = useRef(null);
    const dataChannelRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const navigate = useNavigate();

    const addMessage = useCallback((msg, sender = "R") => {
        setMessages((prev) => [...prev, { sender, msg }]);
    }, []);

    const connectSocket = useCallback(() => {
        try {
            initSocket(`${SERVER_URL}`);
            setError(null);
        } catch (err) {
            setError("Failed to connect to server");
            console.error("Socket connection error:", err);
        }
    }, []);

    const handleDataChannelMessage = useCallback((msg) => {
        addMessage(msg, "R");
    }, [addMessage]);

    const handleRemoteStream = useCallback((stream) => {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
        }
    }, []);

    const handleIceCandidate = useCallback((candidate, userId) => {
        try {
            sendIceCandidate(candidate, userId);
        } catch (err) {
            console.error("Error sending ICE candidate:", err);
        }
    }, []);

    const startRoom = useCallback(async (roomId) => {
        try {
            joinRoom(
                roomId,
                async (userId) => {
                    setConnectedUser(userId);
                    setIsConnected(true);
                    await startCall(userId);
                },
                async (offer, fromUser) => {
                    setConnectedUser(fromUser);
                    setIsConnected(true);

                    try {
                        peerRef.current = createPeerConnection(
                            (msg) => addMessage(msg, "R"),
                            handleRemoteStream,
                            (candidate) => handleIceCandidate(candidate, fromUser)
                        );

                        await setRemoteDescription(offer);

                        // Create data channel for receiving messages
                        dataChannelRef.current = createDataChannel(handleDataChannelMessage);

                        const answer = await createAnswer();
                        sendAnswer(answer, fromUser);
                    } catch (err) {
                        setError("Failed to handle offer");
                        console.error("Offer handling error:", err);
                    }
                },
                async (answer) => {
                    try {
                        await setRemoteDescription(answer);
                    } catch (err) {
                        setError("Failed to set remote description");
                        console.error("Answer handling error:", err);
                    }
                },
                async (candidate) => {
                    try {
                        await addIceCandidate(candidate);
                    } catch (err) {
                        console.error("ICE candidate error:", err);
                    }
                },
                () => {
                    setConnectedUser(null);
                    setRemoteStream(null);
                    setIsConnected(false);
                    addMessage("User disconnected", "System");
                },
                (error) => {
                    setError("Signaling error: " + error);
                    console.error("Signaling error:", error);
                }
            );
        } catch (err) {
            setError("Failed to join room");
            console.error("Room join error:", err);
        }
    }, [addMessage, handleRemoteStream, handleIceCandidate, handleDataChannelMessage]);

    const startCall = async (userId) => {
        try {
            peerRef.current = createPeerConnection(
                (msg) => addMessage(msg, "R"),
                handleRemoteStream,
                (candidate) => handleIceCandidate(candidate, userId)
            );

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });

            setLocalStream(stream);
            cameraStreamRef.current = stream;
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Add stream to peer connection
            await addLocalStream(stream);

            // Create data channel for sending messages
            dataChannelRef.current = createDataChannel(handleDataChannelMessage);

            // Create and send offer
            const offer = await createOffer();
            sendOffer(offer, userId);

        } catch (err) {
            setError("Failed to start call: " + err.message);
            console.error("Call start error:", err);
        }
    };

    const sendChatMessage = useCallback((msg) => {
        if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
            setError("Chat not available");
            return;
        }

        try {
            addMessage(msg, "M");
            sendDataMessage(msg);
        } catch (err) {
            setError("Failed to send message");
            console.error("Message send error:", err);
        }
    }, [addMessage]);

    const toggleMic = useCallback(() => {
        if (!localStream) return;
        
        try {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                console.log("Mic:", audioTracks[0].enabled ? "ON" : "OFF");
            }
        } catch (err) {
            console.error("Mic toggle error:", err);
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (!localStream) return;
        
        try {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoTracks[0].enabled;
                console.log("Camera:", videoTracks[0].enabled ? "ON" : "OFF");
            }
        } catch (err) {
            console.error("Camera toggle error:", err);
        }
    }, [localStream]);

    const startScreenShare = useCallback(async () => {
        if (!peerRef.current) return;

        try {
            // Stop existing screen share if active
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }

            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { cursor: "always" },
                audio: true 
            });

            screenStreamRef.current = screenStream;

            // Replace video track in peer connection
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = peerRef.current.getSenders().find(
                s => s.track && s.track.kind === "video"
            );

            if (sender) {
                await sender.replaceTrack(videoTrack);
            }

            // Update local video display
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            // Handle screen share end
            videoTrack.onended = async () => {
                if (cameraStreamRef.current) {
                    const cameraTrack = cameraStreamRef.current.getVideoTracks()[0];
                    if (sender && cameraTrack) {
                        await sender.replaceTrack(cameraTrack);
                    }
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = cameraStreamRef.current;
                    }
                }
                screenStreamRef.current = null;
                console.log("Screen sharing ended");
            };

            console.log("Screen sharing started");
        } catch (err) {
            if (err.name !== 'NotAllowedError') {
                setError("Screen share failed: " + err.message);
            }
            console.error("Screen share error:", err);
        }
    }, []);

    const endCall = useCallback(() => {
        try {
            // Close peer connection
            if (peerRef.current) {
                closePeerConnection();
                peerRef.current = null;
            }

            // Close data channel
            if (dataChannelRef.current) {
                dataChannelRef.current.close();
                dataChannelRef.current = null;
            }

            // Stop local streams
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }

            // Stop screen share
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }

            // Stop remote stream
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
                setRemoteStream(null);
            }

            // Clear refs
            cameraStreamRef.current = null;

            // Disconnect socket
            disconnectSocket();

            // Reset state
            setConnectedUser(null);
            setIsConnected(false);
            setMessages([]);
            setError(null);

            console.log("Call ended successfully");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error ending call:", err);
            navigate("/dashboard");
        }
    }, [localStream, remoteStream, navigate]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <RTCContext.Provider
            value={{
                localStream,
                remoteStream,
                connectedUser,
                messages,
                isConnected,
                error,
                connectSocket,
                startRoom,
                sendChatMessage,
                toggleMic,
                toggleCamera,
                startScreenShare,
                endCall,
                localVideoRef,
                remoteVideoRef,
                clearError
            }}
        >
            {children}
        </RTCContext.Provider>
    );
};

// import { io } from "socket.io-client";

// let socket = null;
// let ROOM_ID = null;

// export function initSocket(serverUrl) {
//     socket = io(serverUrl);
// }

// export function joinRoom(roomId, onUserJoined, onOffer, onAnswer, onIceCandidate, onUserLeft) {
//     ROOM_ID = roomId;

//     socket.emit("join-room", roomId);

//     socket.on("user-joined", (userId) => {
//         onUserJoined(userId);
//     });

//     socket.on("offer", ({ offer, from }) => {
//         onOffer(offer, from);
//     });

//     socket.on("answer", ({ answer, from }) => {
//         onAnswer(answer, from);
//     });

//     socket.on("ice-candidate", ({ candidate, from }) => {
//         onIceCandidate(candidate, from);
//     });

//     socket.on("user-left", (userId) => {
//         onUserLeft(userId);
//     });
// }

// export function sendOffer(offer, toUserId) {
//     socket.emit("offer", { offer, to: toUserId });
// }

// export function sendAnswer(answer, toUserId) {
//     socket.emit("answer", { answer, to: toUserId });
// }

// export function sendIceCandidate(candidate, toUserId) {
//     socket.emit("ice-candidate", { candidate, to: toUserId });
// }


import { io } from "socket.io-client";

let socket = null;
let ROOM_ID = null;

export function initSocket(serverUrl) {
    try {
        socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        // Connection events
        socket.on('connect', () => {
            console.log('Connected to signaling server');
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from signaling server:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.on('reconnect_attempt', (attempt) => {
            console.log('Reconnection attempt:', attempt);
        });

        socket.on('reconnect_failed', () => {
            console.error('Failed to reconnect to signaling server');
        });

        return socket;
    } catch (error) {
        console.error('Failed to initialize socket:', error);
        throw error;
    }
}

export function joinRoom(roomId, onUserJoined, onOffer, onAnswer, onIceCandidate, onUserLeft, onError) {
    if (!socket || !socket.connected) {
        const error = "Socket not connected";
        if (onError) onError(error);
        throw new Error(error);
    }

    try {
        ROOM_ID = roomId;
        socket.emit("join-room", roomId);

        // Remove existing listeners to avoid duplicates
        socket.off("user-joined");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-left");
        socket.off("error");

        // Set up event listeners
        socket.on("user-joined", (userId) => {
            try {
                onUserJoined(userId);
            } catch (err) {
                console.error("Error in user-joined handler:", err);
            }
        });

        socket.on("offer", ({ offer, from }) => {
            try {
                if (!offer || !from) {
                    throw new Error("Invalid offer data");
                }
                onOffer(offer, from);
            } catch (err) {
                console.error("Error in offer handler:", err);
                if (onError) onError(`Offer handling failed: ${err.message}`);
            }
        });

        socket.on("answer", ({ answer, from }) => {
            try {
                if (!answer || !from) {
                    throw new Error("Invalid answer data");
                }
                onAnswer(answer, from);
            } catch (err) {
                console.error("Error in answer handler:", err);
                if (onError) onError(`Answer handling failed: ${err.message}`);
            }
        });

        socket.on("ice-candidate", ({ candidate, from }) => {
            try {
                if (!candidate || !from) {
                    throw new Error("Invalid ICE candidate data");
                }
                onIceCandidate(candidate, from);
            } catch (err) {
                console.error("Error in ice-candidate handler:", err);
                if (onError) onError(`ICE candidate handling failed: ${err.message}`);
            }
        });

        socket.on("user-left", (userId) => {
            try {
                onUserLeft(userId);
            } catch (err) {
                console.error("Error in user-left handler:", err);
            }
        });

        socket.on("error", (error) => {
            console.error("Signaling server error:", error);
            if (onError) onError(error);
        });

        socket.on("room-error", (error) => {
            console.error("Room error:", error);
            if (onError) onError(error);
        });

    } catch (error) {
        console.error("Error joining room:", error);
        if (onError) onError(`Join room failed: ${error.message}`);
        throw error;
    }
}

export function sendOffer(offer, toUserId) {
    if (!isSocketReady()) return false;

    try {
        if (!offer || !toUserId) {
            throw new Error("Invalid offer data");
        }
        socket.emit("offer", { offer, to: toUserId });
        return true;
    } catch (error) {
        console.error("Error sending offer:", error);
        return false;
    }
}

export function sendAnswer(answer, toUserId) {
    if (!isSocketReady()) return false;

    try {
        if (!answer || !toUserId) {
            throw new Error("Invalid answer data");
        }
        socket.emit("answer", { answer, to: toUserId });
        return true;
    } catch (error) {
        console.error("Error sending answer:", error);
        return false;
    }
}

export function sendIceCandidate(candidate, toUserId) {
    if (!isSocketReady()) return false;

    try {
        if (!candidate || !toUserId) {
            throw new Error("Invalid ICE candidate data");
        }
        socket.emit("ice-candidate", { candidate, to: toUserId });
        return true;
    } catch (error) {
        console.error("Error sending ICE candidate:", error);
        return false;
    }
}

export function leaveRoom() {
    if (socket && ROOM_ID) {
        try {
            socket.emit("leave-room", ROOM_ID);
            
            // Remove all room-specific listeners
            socket.off("user-joined");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("user-left");
            socket.off("error");
            socket.off("room-error");
            
            ROOM_ID = null;
        } catch (error) {
            console.error("Error leaving room:", error);
        }
    }
}

export function disconnectSocket() {
    if (socket) {
        try {
            // Remove all listeners
            socket.removeAllListeners();
            
            // Disconnect socket
            socket.disconnect();
            
            socket = null;
            ROOM_ID = null;
            
            console.log("Socket disconnected");
        } catch (error) {
            console.error("Error disconnecting socket:", error);
        }
    }
}

export function getSocketStatus() {
    return socket ? {
        connected: socket.connected,
        id: socket.id,
        roomId: ROOM_ID
    } : null;
}

// Helper function to check socket readiness
function isSocketReady() {
    if (!socket) {
        console.error("Socket not initialized");
        return false;
    }
    
    if (!socket.connected) {
        console.error("Socket not connected");
        return false;
    }
    
    if (!ROOM_ID) {
        console.error("Not in a room");
        return false;
    }
    
    return true;
}
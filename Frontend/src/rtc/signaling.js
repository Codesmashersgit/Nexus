
import { io } from "socket.io-client";

let socket = null;
let currentRoomId = null;

export function initSocket(serverUrl) {
    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    return socket;
}

export function joinRoom(roomId, onJoin, onOffer, onAnswer, onIce, onLeave) {
    if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
    }

    currentRoomId = roomId;

    // Remove existing listeners to prevent duplicates
    socket.off("user-joined");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("user-left");

    // Join the room
    socket.emit("join-room", roomId);
    console.log("Joining room:", roomId);

    // Set up event listeners
    socket.on("user-joined", (userId) => {
        console.log("User joined:", userId);
        onJoin(userId);
    });

    socket.on("offer", ({ offer, from }) => {
        console.log("Offer received from:", from);
        onOffer(offer, from);
    });

    socket.on("answer", ({ answer, from }) => {
        console.log("Answer received from:", from);
        onAnswer(answer);
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
        console.log("ICE candidate received from:", from);
        onIce(candidate);
    });

    socket.on("user-left", (userId) => {
        console.log("User left:", userId);
        onLeave();
    });
}

export const sendOffer = (offer, to) => {
    if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
    }
    console.log("Sending offer to:", to);
    socket.emit("offer", { offer, to });
};

export const sendAnswer = (answer, to) => {
    if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
    }
    console.log("Sending answer to:", to);
    socket.emit("answer", { answer, to });
};

export const sendIceCandidate = (candidate, to) => {
    if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
    }
    console.log("Sending ICE candidate to:", to);
    socket.emit("ice-candidate", { candidate, to });
};

export const disconnectSocket = () => {
    if (socket) {
        if (currentRoomId) {
            socket.emit("leave-room", currentRoomId);
        }
        
        socket.off("user-joined");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-left");
        
        socket.disconnect();
        socket = null;
        currentRoomId = null;
        console.log("Socket disconnected");
    }
};

export const getSocket = () => socket;

import { io } from "socket.io-client";

let socket = null;
let ROOM_ID = null;

export function initSocket(serverUrl) {
    socket = io(serverUrl);
}

export function joinRoom(roomId, onUserJoined, onOffer, onAnswer, onIceCandidate, onUserLeft) {
    ROOM_ID = roomId;

    socket.emit("join-room", roomId);

    socket.on("user-joined", (userId) => {
        onUserJoined(userId);
    });

    socket.on("offer", ({ offer, from }) => {
        onOffer(offer, from);
    });

    socket.on("answer", ({ answer, from }) => {
        onAnswer(answer, from);
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
        onIceCandidate(candidate, from);
    });

    socket.on("user-left", (userId) => {
        onUserLeft(userId);
    });
}

export function sendOffer(offer, toUserId) {
    socket.emit("offer", { offer, to: toUserId });
}

export function sendAnswer(answer, toUserId) {
    socket.emit("answer", { answer, to: toUserId });
}

export function sendIceCandidate(candidate, toUserId) {
    socket.emit("ice-candidate", { candidate, to: toUserId });
}

// src/rtc/peer.js

let peerConnection = null;
let dataChannel = null;

// Create Peer Connection
export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) onIceCandidate(event.candidate);
    };

    peerConnection.ontrack = (event) => {
        onStream(event.streams[0]);
    };

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onmessage = (e) => onMessage(e.data);
    };

    return peerConnection;
};

export const createDataChannel = (onMessage) => {
    dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.onmessage = (e) => onMessage(e.data);
};

// Send Message through DataChannel
export const sendMessage = (msg) => {
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msg);
    }
};

// Add Local Media Stream
export const addLocalStream = async (stream) => {
    stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
    });
};

// Create Offer
export const createOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
};

// Create Answer
export const createAnswer = async () => {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
};

// Set Remote Description
export const setRemoteDescription = async (desc) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
};

// Add ICE Candidate
export const addIceCandidate = async (candidate) => {
    await peerConnection.addIceCandidate(candidate);
};

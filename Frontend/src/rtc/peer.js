

// let peerConnection = null;
// let dataChannel = null;

// export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
//     peerConnection = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//     });

//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) onIceCandidate(event.candidate);
//     };

//     peerConnection.ontrack = (event) => {
//         onStream(event.streams[0]);
//     };

//     peerConnection.ondatachannel = (event) => {
//         dataChannel = event.channel;
//         dataChannel.onmessage = (e) => onMessage(e.data);
//     };

//     return peerConnection;
// };

// export const createDataChannel = (onMessage) => {
//     dataChannel = peerConnection.createDataChannel("chat");
//     dataChannel.onmessage = (e) => onMessage(e.data);
// };

// // Send Message through DataChannel
// export const sendMessage = (msg) => {
//     if (dataChannel && dataChannel.readyState === "open") {
//         dataChannel.send(msg);
//     }
// };

// // Add Local Media Stream
// export const addLocalStream = async (stream) => {
//     stream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, stream);
//     });
// };

// // Create Offer
// export const createOffer = async () => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     return offer;
// };

// // Create Answer
// export const createAnswer = async () => {
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     return answer;
// };

// // Set Remote Description
// export const setRemoteDescription = async (desc) => {
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
// };

// // Add ICE Candidate
// export const addIceCandidate = async (candidate) => {
//     await peerConnection.addIceCandidate(candidate);
// };


// src/rtc/peer.js
// peer.js
export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    let dataChannel = null;

    // ICE candidate
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) onIceCandidate(event.candidate);
    };

    // Remote stream
    peerConnection.ontrack = (event) => {
        onStream(event.streams[0]);
    };

    // Data channel for answerer
    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onmessage = (e) => onMessage(e.data);
    };

    return { peerConnection, getDataChannel: () => dataChannel };
};

// Only offerer creates data channel
export const createDataChannel = (peerConnection, onMessage) => {
    const dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.onmessage = (e) => onMessage(e.data);
    return dataChannel;
};

// Send message
export const sendMessage = (dataChannel, msg) => {
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msg);
    }
};

// Add local media stream
export const addLocalStream = (peerConnection, stream) => {
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
};

// Create offer
export const createOffer = async (peerConnection) => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
};

// Create answer
export const createAnswer = async (peerConnection) => {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
};

// Set remote description
export const setRemoteDescription = async (peerConnection, desc) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
};

// Add ICE candidate
export const addIceCandidate = async (peerConnection, candidate) => {
    await peerConnection.addIceCandidate(candidate);
};

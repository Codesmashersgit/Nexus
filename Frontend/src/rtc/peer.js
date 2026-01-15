// let peerConnection = null;
// let dataChannel = null;

// export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
//     // Close existing connection if any
//     if (peerConnection) {
//         peerConnection.close();
//     }

//     peerConnection = new RTCPeerConnection({
//         iceServers: [
//             { urls: "stun:stun.l.google.com:19302" },
//             { urls: "stun:stun1.l.google.com:19302" }
//         ]
//     });

//     // Handle ICE candidates
//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//             onIceCandidate(event.candidate);
//         }
//     };

//     // Handle incoming tracks (remote stream)
//     peerConnection.ontrack = (event) => {
//         console.log("Received remote track:", event.streams[0]);
//         onStream(event.streams[0]);
//     };

//     // Handle incoming data channel (for answerer)
//     peerConnection.ondatachannel = (event) => {
//         console.log("Data channel received");
//         dataChannel = event.channel;
//         setupDataChannelListeners(dataChannel, onMessage);
//     };

//     // Monitor connection state
//     peerConnection.onconnectionstatechange = () => {
//         console.log("Connection state:", peerConnection.connectionState);
//     };

//     peerConnection.oniceconnectionstatechange = () => {
//         console.log("ICE connection state:", peerConnection.iceConnectionState);
//     };

//     return peerConnection;
// };

// // Setup data channel listeners
// const setupDataChannelListeners = (channel, onMessage) => {
//     channel.onopen = () => console.log("Data channel opened");
//     channel.onclose = () => console.log("Data channel closed");
//     channel.onmessage = (e) => onMessage(e.data);
// };

// // Create data channel (for offerer)
// export const createDataChannel = (onMessage) => {
//     if (!peerConnection) {
//         console.error("Peer connection not initialized");
//         return null;
//     }
    
//     dataChannel = peerConnection.createDataChannel("chat");
//     setupDataChannelListeners(dataChannel, onMessage);
//     return dataChannel;
// };

// // Send message through data channel
// export const sendMessage = (msg) => {
//     if (dataChannel && dataChannel.readyState === "open") {
//         dataChannel.send(msg);
//         return true;
//     }
//     console.warn("Data channel not ready");
//     return false;
// };

// // Add local media stream
// export const addLocalStream = async (stream) => {
//     if (!peerConnection) {
//         console.error("Peer connection not initialized");
//         return;
//     }

//     // Remove existing tracks first
//     const senders = peerConnection.getSenders();
//     senders.forEach(sender => peerConnection.removeTrack(sender));

//     // Add new tracks
//     stream.getTracks().forEach((track) => {
//         console.log("Adding track:", track.kind);
//         peerConnection.addTrack(track, stream);
//     });
// };

// // Create offer
// export const createOffer = async () => {
//     if (!peerConnection) {
//         throw new Error("Peer connection not initialized");
//     }

//     const offer = await peerConnection.createOffer({
//         offerToReceiveAudio: true,
//         offerToReceiveVideo: true
//     });
//     await peerConnection.setLocalDescription(offer);
//     console.log("Offer created");
//     return offer;
// };

// // Create answer
// export const createAnswer = async () => {
//     if (!peerConnection) {
//         throw new Error("Peer connection not initialized");
//     }

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     console.log("Answer created");
//     return answer;
// };

// // Set remote description
// export const setRemoteDescription = async (desc) => {
//     if (!peerConnection) {
//         throw new Error("Peer connection not initialized");
//     }

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
//     console.log("Remote description set");
// };

// // Add ICE candidate
// export const addIceCandidate = async (candidate) => {
//     if (!peerConnection) {
//         console.error("Peer connection not initialized");
//         return;
//     }

//     try {
//         await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log("ICE candidate added");
//     } catch (err) {
//         console.error("Error adding ICE candidate:", err);
//     }
// };

// // Close peer connection
// export const closePeerConnection = () => {
//     if (dataChannel) {
//         dataChannel.close();
//         dataChannel = null;
//     }
    
//     if (peerConnection) {
//         peerConnection.close();
//         peerConnection = null;
//     }
    
//     console.log("Peer connection closed");
// };

// // Get current peer connection
// export const getPeerConnection = () => peerConnection;




let peerConnection = null;
let dataChannel = null;

export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
    if (peerConnection) peerConnection.close();

    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) onIceCandidate(event.candidate);
    };

    peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.streams[0]);
        onStream(event.streams[0]);
    };

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannelListeners(dataChannel, onMessage);
    };

    return peerConnection;
};

const setupDataChannelListeners = (channel, onMessage) => {
    channel.onopen = () => console.log("Data channel opened");
    channel.onclose = () => console.log("Data channel closed");
    channel.onmessage = (e) => onMessage(e.data);
};

export const createDataChannel = (onMessage) => {
    if (!peerConnection) return null;

    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannelListeners(dataChannel, onMessage);
    return dataChannel;
};

export const sendMessage = (msg) => {
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msg);
        return true;
    }
    console.warn("Data channel not ready");
    return false;
};

export const addLocalStream = async (stream) => {
    if (!peerConnection) return;

    // DO NOT REMOVE EXISTING SENDERS — THIS WAS BREAKING YOUR SETUP
    stream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind);
        peerConnection.addTrack(track, stream);
    });
};

export const createOffer = async () => {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    return offer;
};

export const createAnswer = async () => {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    return answer;
};

export const setRemoteDescription = async (desc) => {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    await peerConnection.setRemoteDescription(desc);
};

export const addIceCandidate = async (candidate) => {
    if (!peerConnection) return;

    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (err) {
        console.error("Error adding ICE candidate:", err);
    }
};

export const closePeerConnection = () => {
    if (dataChannel) dataChannel.close();
    if (peerConnection) peerConnection.close();

    dataChannel = null;
    peerConnection = null;
};

export const getPeerConnection = () => peerConnection;



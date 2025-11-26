

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


// Remove global variables - each peer connection should be isolated

export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    });

    let dataChannel = null;

    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            try {
                onIceCandidate(event.candidate);
            } catch (err) {
                console.error("Error handling ICE candidate:", err);
            }
        }
    };

    // Remote stream handling
    peerConnection.ontrack = (event) => {
        try {
            if (event.streams && event.streams[0]) {
                onStream(event.streams[0]);
            }
        } catch (err) {
            console.error("Error handling remote track:", err);
        }
    };

    // Incoming data channel
    peerConnection.ondatachannel = (event) => {
        try {
            dataChannel = event.channel;
            setupDataChannel(dataChannel, onMessage);
        } catch (err) {
            console.error("Error handling data channel:", err);
        }
    };

    // Connection state monitoring
    peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
    };

    // Return both peer connection and data channel manager
    return {
        peerConnection,
        createDataChannel: (onMessage) => createDataChannel(peerConnection, onMessage),
        sendMessage: (msg) => sendMessage(dataChannel, msg),
        addLocalStream: (stream) => addLocalStream(peerConnection, stream),
        createOffer: () => createOffer(peerConnection),
        createAnswer: () => createAnswer(peerConnection),
        setRemoteDescription: (desc) => setRemoteDescription(peerConnection, desc),
        addIceCandidate: (candidate) => addIceCandidate(peerConnection, candidate),
        close: () => closePeerConnection(peerConnection, dataChannel)
    };
};

const setupDataChannel = (dataChannel, onMessage) => {
    dataChannel.onopen = () => {
        console.log("Data channel opened");
    };

    dataChannel.onmessage = (e) => {
        try {
            onMessage(e.data);
        } catch (err) {
            console.error("Error handling data channel message:", err);
        }
    };

    dataChannel.onclose = () => {
        console.log("Data channel closed");
    };

    dataChannel.onerror = (error) => {
        console.error("Data channel error:", error);
    };
};

export const createDataChannel = (peerConnection, onMessage) => {
    try {
        const dataChannel = peerConnection.createDataChannel("chat", {
            ordered: true
        });
        setupDataChannel(dataChannel, onMessage);
        return dataChannel;
    } catch (err) {
        console.error("Error creating data channel:", err);
        throw err;
    }
};

export const sendMessage = (dataChannel, msg) => {
    if (!dataChannel) {
        console.error("Data channel not initialized");
        return false;
    }

    if (dataChannel.readyState !== "open") {
        console.error("Data channel not open. State:", dataChannel.readyState);
        return false;
    }

    try {
        dataChannel.send(msg);
        return true;
    } catch (err) {
        console.error("Error sending message:", err);
        return false;
    }
};

export const addLocalStream = async (peerConnection, stream) => {
    try {
        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });
    } catch (err) {
        console.error("Error adding local stream:", err);
        throw err;
    }
};

export const createOffer = async (peerConnection) => {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    } catch (err) {
        console.error("Error creating offer:", err);
        throw err;
    }
};

export const createAnswer = async (peerConnection) => {
    try {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    } catch (err) {
        console.error("Error creating answer:", err);
        throw err;
    }
};

export const setRemoteDescription = async (peerConnection, desc) => {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
    } catch (err) {
        console.error("Error setting remote description:", err);
        throw err;
    }
};

export const addIceCandidate = async (peerConnection, candidate) => {
    try {
        if (candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    } catch (err) {
        console.error("Error adding ICE candidate:", err);
        throw err;
    }
};

export const closePeerConnection = (peerConnection, dataChannel) => {
    try {
        // Close data channel
        if (dataChannel) {
            dataChannel.close();
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
        }

        console.log("Peer connection closed");
    } catch (err) {
        console.error("Error closing peer connection:", err);
    }
};
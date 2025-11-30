

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
let peer;

export function createPeerConnection(onMessage, onRemoteStream, onIce) {
    peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peer.ontrack = (e) => onRemoteStream(e.streams[0]);

    peer.onicecandidate = (e) => {
        if (e.candidate) onIce(e.candidate);
    };

    peer.ondatachannel = (e) => {
        const channel = e.channel;
        channel.onmessage = (m) => onMessage(m.data);
    };

    return peer;
}

export const addLocalStream = (stream) =>
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

export const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
};

export const createAnswer = async () => {
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
};

export const setRemoteDescription = async (desc) =>
    await peer.setRemoteDescription(desc);

export const addIceCandidate = async (candidate) =>
    await peer.addIceCandidate(candidate);

export const createDataChannel = (onMsg) => {
    const channel = peer.createDataChannel("chat");
    channel.onmessage = (e) => onMsg(e.data);
    return channel;
};

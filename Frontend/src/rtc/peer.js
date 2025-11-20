

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
export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  let dataChannel = null;

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate);
  };

  pc.ontrack = (event) => {
    onStream(event.streams[0]);
  };

  pc.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (e) => onMessage(e.data);
  };

  return {
    pc,
    createDataChannel: (onMessageCb) => {
      dataChannel = pc.createDataChannel("chat");
      dataChannel.onmessage = (e) => onMessageCb(e.data);
    },
    sendMessage: (msg) => {
      if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msg);
      }
    },
    addLocalStream: async (stream) => {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    },
    createOffer: async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      return offer;
    },
    createAnswer: async () => {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    },
    setRemoteDescription: async (desc) => {
      await pc.setRemoteDescription(new RTCSessionDescription(desc));
    },
    addIceCandidate: async (candidate) => {
      await pc.addIceCandidate(candidate);
    }
  };
};

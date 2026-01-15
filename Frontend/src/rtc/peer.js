// // let peerConnection = null;
// // let dataChannel = null;

// // export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
// //     // Close existing connection if any
// //     if (peerConnection) {
// //         peerConnection.close();
// //     }

// //     peerConnection = new RTCPeerConnection({
// //         iceServers: [
// //             { urls: "stun:stun.l.google.com:19302" },
// //             { urls: "stun:stun1.l.google.com:19302" }
// //         ]
// //     });

// //     // Handle ICE candidates
// //     peerConnection.onicecandidate = (event) => {
// //         if (event.candidate) {
// //             onIceCandidate(event.candidate);
// //         }
// //     };

// //     // Handle incoming tracks (remote stream)
// //     peerConnection.ontrack = (event) => {
// //         console.log("Received remote track:", event.streams[0]);
// //         onStream(event.streams[0]);
// //     };

// //     // Handle incoming data channel (for answerer)
// //     peerConnection.ondatachannel = (event) => {
// //         console.log("Data channel received");
// //         dataChannel = event.channel;
// //         setupDataChannelListeners(dataChannel, onMessage);
// //     };

// //     // Monitor connection state
// //     peerConnection.onconnectionstatechange = () => {
// //         console.log("Connection state:", peerConnection.connectionState);
// //     };

// //     peerConnection.oniceconnectionstatechange = () => {
// //         console.log("ICE connection state:", peerConnection.iceConnectionState);
// //     };

// //     return peerConnection;
// // };

// // // Setup data channel listeners
// // const setupDataChannelListeners = (channel, onMessage) => {
// //     channel.onopen = () => console.log("Data channel opened");
// //     channel.onclose = () => console.log("Data channel closed");
// //     channel.onmessage = (e) => onMessage(e.data);
// // };

// // // Create data channel (for offerer)
// // export const createDataChannel = (onMessage) => {
// //     if (!peerConnection) {
// //         console.error("Peer connection not initialized");
// //         return null;
// //     }
    
// //     dataChannel = peerConnection.createDataChannel("chat");
// //     setupDataChannelListeners(dataChannel, onMessage);
// //     return dataChannel;
// // };

// // // Send message through data channel
// // export const sendMessage = (msg) => {
// //     if (dataChannel && dataChannel.readyState === "open") {
// //         dataChannel.send(msg);
// //         return true;
// //     }
// //     console.warn("Data channel not ready");
// //     return false;
// // };

// // // Add local media stream
// // export const addLocalStream = async (stream) => {
// //     if (!peerConnection) {
// //         console.error("Peer connection not initialized");
// //         return;
// //     }

// //     // Remove existing tracks first
// //     const senders = peerConnection.getSenders();
// //     senders.forEach(sender => peerConnection.removeTrack(sender));

// //     // Add new tracks
// //     stream.getTracks().forEach((track) => {
// //         console.log("Adding track:", track.kind);
// //         peerConnection.addTrack(track, stream);
// //     });
// // };

// // // Create offer
// // export const createOffer = async () => {
// //     if (!peerConnection) {
// //         throw new Error("Peer connection not initialized");
// //     }

// //     const offer = await peerConnection.createOffer({
// //         offerToReceiveAudio: true,
// //         offerToReceiveVideo: true
// //     });
// //     await peerConnection.setLocalDescription(offer);
// //     console.log("Offer created");
// //     return offer;
// // };

// // // Create answer
// // export const createAnswer = async () => {
// //     if (!peerConnection) {
// //         throw new Error("Peer connection not initialized");
// //     }

// //     const answer = await peerConnection.createAnswer();
// //     await peerConnection.setLocalDescription(answer);
// //     console.log("Answer created");
// //     return answer;
// // };

// // // Set remote description
// // export const setRemoteDescription = async (desc) => {
// //     if (!peerConnection) {
// //         throw new Error("Peer connection not initialized");
// //     }

// //     await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
// //     console.log("Remote description set");
// // };

// // // Add ICE candidate
// // export const addIceCandidate = async (candidate) => {
// //     if (!peerConnection) {
// //         console.error("Peer connection not initialized");
// //         return;
// //     }

// //     try {
// //         await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
// //         console.log("ICE candidate added");
// //     } catch (err) {
// //         console.error("Error adding ICE candidate:", err);
// //     }
// // };

// // // Close peer connection
// // export const closePeerConnection = () => {
// //     if (dataChannel) {
// //         dataChannel.close();
// //         dataChannel = null;
// //     }
    
// //     if (peerConnection) {
// //         peerConnection.close();
// //         peerConnection = null;
// //     }
    
// //     console.log("Peer connection closed");
// // };

// // // Get current peer connection
// // export const getPeerConnection = () => peerConnection;




// let peerConnection = null;
// let dataChannel = null;

// export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
//     if (peerConnection) peerConnection.close();

//     peerConnection = new RTCPeerConnection({
//         iceServers: [
//             { urls: "stun:stun.l.google.com:19302" },
//             { urls: "stun:stun1.l.google.com:19302" }
//         ]
//     });

//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) onIceCandidate(event.candidate);
//     };

//     peerConnection.ontrack = (event) => {
//         console.log("Remote track received:", event.streams[0]);
//         onStream(event.streams[0]);
//     };

//     peerConnection.ondatachannel = (event) => {
//         dataChannel = event.channel;
//         setupDataChannelListeners(dataChannel, onMessage);
//     };

//     return peerConnection;
// };

// const setupDataChannelListeners = (channel, onMessage) => {
//     channel.onopen = () => console.log("Data channel opened");
//     channel.onclose = () => console.log("Data channel closed");
//     channel.onmessage = (e) => onMessage(e.data);
// };

// export const createDataChannel = (onMessage) => {
//     if (!peerConnection) return null;

//     dataChannel = peerConnection.createDataChannel("chat");
//     setupDataChannelListeners(dataChannel, onMessage);
//     return dataChannel;
// };

// export const sendMessage = (msg) => {
//     if (dataChannel && dataChannel.readyState === "open") {
//         dataChannel.send(msg);
//         return true;
//     }
//     console.warn("Data channel not ready");
//     return false;
// };

// export const addLocalStream = async (stream) => {
//     if (!peerConnection) return;

//     // DO NOT REMOVE EXISTING SENDERS — THIS WAS BREAKING YOUR SETUP
//     stream.getTracks().forEach((track) => {
//         console.log("Adding track:", track.kind);
//         peerConnection.addTrack(track, stream);
//     });
// };

// export const createOffer = async () => {
//     if (!peerConnection) throw new Error("Peer connection not initialized");

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     return offer;
// };

// export const createAnswer = async () => {
//     if (!peerConnection) throw new Error("Peer connection not initialized");

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);

//     return answer;
// };

// export const setRemoteDescription = async (desc) => {
//     if (!peerConnection) throw new Error("Peer connection not initialized");

//     await peerConnection.setRemoteDescription(desc);
// };

// export const addIceCandidate = async (candidate) => {
//     if (!peerConnection) return;

//     try {
//         await peerConnection.addIceCandidate(candidate);
//     } catch (err) {
//         console.error("Error adding ICE candidate:", err);
//     }
// };

// export const closePeerConnection = () => {
//     if (dataChannel) dataChannel.close();
//     if (peerConnection) peerConnection.close();

//     dataChannel = null;
//     peerConnection = null;
// };

// export const getPeerConnection = () => peerConnection;





// let peerConnection = null;
// let dataChannel = null;

// export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
//     if (peerConnection) {
//         peerConnection.close();
//     }

//     peerConnection = new RTCPeerConnection({
//         iceServers: [
//             { urls: "stun:stun.l.google.com:19302" },
//             { urls: "stun:stun1.l.google.com:19302" }
//         ]
//     });

//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//             onIceCandidate(event.candidate);
//         }
//     };

//     peerConnection.ontrack = (event) => {
//         console.log("Remote track received:", event.streams[0]);
//         onStream(event.streams[0]);
//     };

//     peerConnection.ondatachannel = (event) => {
//         console.log("Data channel received");
//         dataChannel = event.channel;
//         setupDataChannelListeners(dataChannel, onMessage);
//     };

//     peerConnection.onconnectionstatechange = () => {
//         console.log("Connection state:", peerConnection.connectionState);
//     };

//     peerConnection.oniceconnectionstatechange = () => {
//         console.log("ICE connection state:", peerConnection.iceConnectionState);
//     };

//     return peerConnection;
// };

// const setupDataChannelListeners = (channel, onMessage) => {
//     channel.onopen = () => console.log("Data channel opened");
//     channel.onclose = () => console.log("Data channel closed");
//     channel.onmessage = (e) => onMessage(e.data);
//     channel.onerror = (error) => console.error("Data channel error:", error);
// };

// export const createDataChannel = (onMessage) => {
//     if (!peerConnection) {
//         console.error("Peer connection not initialized");
//         return null;
//     }

//     dataChannel = peerConnection.createDataChannel("chat");
//     setupDataChannelListeners(dataChannel, onMessage);
//     return dataChannel;
// };

// export const sendMessage = (msg) => {
//     if (dataChannel && dataChannel.readyState === "open") {
//         dataChannel.send(msg);
//         return true;
//     }
//     console.warn("Data channel not ready");
//     return false;
// };

// export const addLocalStream = async (stream) => {
//     if (!peerConnection) {
//         console.error("Peer connection not initialized");
//         return;
//     }

//     // Check if tracks already added to avoid duplicates
//     const existingSenders = peerConnection.getSenders();
//     const existingTrackIds = existingSenders
//         .map(sender => sender.track?.id)
//         .filter(Boolean);

//     stream.getTracks().forEach((track) => {
//         // Only add if not already added
//         if (!existingTrackIds.includes(track.id)) {
//             console.log("Adding track:", track.kind);
//             peerConnection.addTrack(track, stream);
//         } else {
//             console.log("Track already added:", track.kind);
//         }
//     });
// };

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

// export const createAnswer = async () => {
//     if (!peerConnection) {
//         throw new Error("Peer connection not initialized");
//     }

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     console.log("Answer created");
//     return answer;
// };

// export const setRemoteDescription = async (desc) => {
//     if (!peerConnection) {
//         throw new Error("Peer connection not initialized");
//     }

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
//     console.log("Remote description set");
// };

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

// export const getPeerConnection = () => peerConnection;





export const createPeerConnection = (onMessage, onStream, onIceCandidate) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  let dataChannel = null;
  const iceQueue = [];

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    onStream(event.streams[0]);
  };

  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    setupDataChannelListeners(dataChannel, onMessage);
  };

  const setupDataChannelListeners = (channel, onMessage) => {
    channel.onopen = () => console.log("Data channel opened");
    channel.onclose = () => console.log("Data channel closed");
    channel.onerror = (err) => console.error("Data channel error:", err);
    channel.onmessage = (e) => onMessage(e.data);
  };

  const createDataChannel = (onMessage) => {
    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannelListeners(dataChannel, onMessage);
    return dataChannel;
  };

  const sendMessage = (msg) => {
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(msg);
      return true;
    }
    console.warn("Data channel not ready");
    return false;
  };

  const addLocalStream = (stream) => {
    const existingTrackIds = peerConnection.getSenders()
      .map((s) => s.track?.id)
      .filter(Boolean);
    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.includes(track.id)) {
        peerConnection.addTrack(track, stream);
      }
    });
  };

  const createOffer = async () => {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async () => {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  };

  const setRemoteDescription = async (desc) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
    // Add queued ICE candidates after remote description is set
    iceQueue.forEach(async (c) => await peerConnection.addIceCandidate(new RTCIceCandidate(c)));
    iceQueue.length = 0;
  };

  const addIceCandidate = async (candidate) => {
    if (peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      iceQueue.push(candidate);
    }
  };

  const closePeerConnection = () => {
    dataChannel?.close();
    peerConnection.close();
  };

  return {
    peerConnection,
    createDataChannel,
    sendMessage,
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closePeerConnection,
  };
};

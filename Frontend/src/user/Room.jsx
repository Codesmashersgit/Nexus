// Room.jsx
import React, { useEffect, useRef, useState } from "react";
import socket from "./socket"; // ✅ Yahan import kiya

function Room({ roomName, userName }) {
  const localVideoRef = useRef();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peersRef = useRef({});

  useEffect(() => {
    // 1️⃣ Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;

        // 2️⃣ Join room
        socket.emit("join-room", { roomName, userName });

        // 3️⃣ Listen for existing users
        socket.on("all-users", (users) => {
          console.log("Existing users in room:", users);
          // TODO: Create SFU peer connections
        });

        // 4️⃣ Listen for new user joining
        socket.on("user-joined", (payload) => {
          console.log("New user joined:", payload.userName);
          // TODO: SFU peer connection logic
        });

        // 5️⃣ Listen for user leaving
        socket.on("user-left", (id) => {
          if (peersRef.current[id]) {
            peersRef.current[id].close();
            delete peersRef.current[id];
            setRemoteStreams(prev => prev.filter(r => r.id !== id));
          }
        });
      })
      .catch(err => console.error("Media error:", err));

    return () => {
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [roomName, userName]);

  return (
    <div>
      <h2>Room: {roomName}</h2>
      <video ref={localVideoRef} autoPlay playsInline className="local-video" />
      <div className="remote-videos">
        {remoteStreams.map((streamObj) => (
          <video
            key={streamObj.id}
            srcObject={streamObj.stream}
            autoPlay
            playsInline
          />
        ))}
      </div>
    </div>
  );
}

export default Room;

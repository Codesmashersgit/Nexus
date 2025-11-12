require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET","POST"] } });

const PORT = process.env.PORT || 5000;

let worker;
let router;
const rooms = {}; // roomId -> { router, peers }

async function createWorker() {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  });

  worker.on("died", () => {
    console.error("mediasoup worker died!");
    process.exit(1);
  });

  console.log("✅ Mediasoup worker created");
}

async function createRoom(roomId) {
  const mediaCodecs = [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {},
    },
  ];

  const router = await worker.createRouter({ mediaCodecs });
  rooms[roomId] = { router, peers: {} };
  return rooms[roomId];
}

io.on("connection", (socket) => {
  console.log(`🟢 New socket: ${socket.id}`);

  socket.on("join-room", async ({ roomID, name }) => {
    if (!rooms[roomID]) await createRoom(roomID);
    const room = rooms[roomID];

    room.peers[socket.id] = { socket, name, transports: {}, producers: {}, consumers: {} };
    socket.join(roomID);

    socket.emit("joined-room", { peers: Object.keys(room.peers).filter(id => id !== socket.id) });
  });

  // create transport
  socket.on("create-transport", async ({ roomID }, callback) => {
    const room = rooms[roomID];
    if (!room) return;

    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    room.peers[socket.id].transports[transport.id] = transport;

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  // connect transport
  socket.on("connect-transport", async ({ roomID, transportId, dtlsParameters }, callback) => {
    const room = rooms[roomID];
    await room.peers[socket.id].transports[transportId].connect({ dtlsParameters });
    callback({ connected: true });
  });

  // produce
  socket.on("produce", async ({ roomID, transportId, kind, rtpParameters }, callback) => {
    const room = rooms[roomID];
    const transport = room.peers[socket.id].transports[transportId];
    const producer = await transport.produce({ kind, rtpParameters });

    room.peers[socket.id].producers[producer.id] = producer;

    // notify other peers to consume
    socket.to(roomID).emit("new-producer", { producerId: producer.id, producerSocketId: socket.id, kind });
    callback({ id: producer.id });
  });

  // consume
  socket.on("consume", async ({ roomID, producerId, transportId }, callback) => {
    const room = rooms[roomID];
    const transport = room.peers[socket.id].transports[transportId];
    const producerPeerId = Object.keys(room.peers).find(id =>
      Object.values(room.peers[id].producers).some(p => p.id === producerId)
    );
    if (!producerPeerId) return;

    const producer = room.peers[producerPeerId].producers[producerId];
    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: room.router.rtpCapabilities,
      paused: false,
    });

    room.peers[socket.id].consumers[consumer.id] = consumer;

    callback({
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    // cleanup
  });
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

Promise.all([createWorker(), mongoose.connect(process.env.MONGO_URI)])
  .then(() => {
    console.log("✅ MongoDB connected & Worker ready");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Initialization error:", err));
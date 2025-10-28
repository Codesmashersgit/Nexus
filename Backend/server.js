const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
const path = require("path");

const { Server } = require("socket.io");
const http = require("http");
const authRoutes = require("./Routes/authRoute");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// API routes
app.use("/api/auth", authRoutes);

// Serve React frontend (after declaring app)
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (roomID) => {
    socket.join(roomID);
    socket.roomID = roomID;
    socket.to(roomID).emit("user-joined", socket.id);
  });

  socket.on("signal", (data) => io.to(data.to).emit("signal", data));

  socket.on("send-message", ({ name, message }) => {
    if (socket.roomID) {
      io.to(socket.roomID).emit("receive-message", {
        id: socket.id,
        name,
        message,
      });
    }
  });

  socket.on("typing", (data) => {
    if (socket.roomID) socket.to(socket.roomID).emit("typing", { id: socket.id, name: data.name });
  });

  socket.on("stop-typing", () => {
    if (socket.roomID) socket.to(socket.roomID).emit("stop-typing", { id: socket.id });
  });

  socket.on("disconnect", () => {
    if (socket.roomID) socket.to(socket.roomID).emit("user-left", socket.id);
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// MongoDB connect and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/authRoute");
require("./config/passport");

const app = express();
const server = http.createServer(app);

// ===== MongoDB connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== Middlewares =====
app.use(express.json());
app.use(cors({
  origin: [process.env.VITE_CLIENT_URL, "http://localhost:5173"],
  credentials: true,
}));
app.use(passport.initialize());

// ===== Routes =====
app.use("/api/auth", authRoutes);

// ===== Socket.IO =====
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [process.env.VITE_CLIENT_URL, "http://localhost:5173"],
    methods: ["GET", "POST"]
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

// ===== Socket.IO room logic =====
const rooms = {};

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("join-room", ({ roomId, name, email }) => {
    if (!rooms[roomId]) rooms[roomId] = [];

    // Normalize email for consistent comparison
    const normalizedEmail = email ? email.toLowerCase().trim() : "anonymous";
    console.log(`User ${name} (${normalizedEmail}) attempting to join room ${roomId}`);

    // Enforce 1-user-per-email limit
    const isEmailDuplicate = rooms[roomId].some(u => {
      const uEmail = u.email ? u.email.toLowerCase().trim() : "anonymous";
      return uEmail === normalizedEmail;
    });

    if (isEmailDuplicate) {
      console.log(`Join denied: Duplicate email ${normalizedEmail} in room ${roomId}`);
      socket.emit("duplicate-email", { message: "You are not allowed to enter into this room. First you have to change email because the email is already in use" });
      return;
    }

    // Enforce 2-user limit
    if (rooms[roomId].length >= 2) {
      socket.emit("room-full", { message: "This room is full. Only 2 users are allowed." });
      return;
    }

    // Existing users data
    const existingUsers = rooms[roomId].map(u => ({ id: u.id, name: u.name }));
    socket.emit("all-users", existingUsers);

    const newUser = { id: socket.id, name, email: normalizedEmail };
    rooms[roomId].push(newUser);
    socket.join(roomId);

    console.log(`User ${name} (${normalizedEmail}) joined room ${roomId}. Total users: ${rooms[roomId].length}`);

    // Notify others
    socket.to(roomId).emit("user-joined", newUser);

    socket.on("offer", ({ offer, to }) => {
      io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
      io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("typing-start", ({ name }) => {
      socket.to(roomId).emit("typing-start", { userId: socket.id, name });
    });

    socket.on("typing-stop", () => {
      socket.to(roomId).emit("typing-stop", { userId: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id);
        socket.to(roomId).emit("user-left", socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
      }
    });
  });
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

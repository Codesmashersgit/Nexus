require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/authRoutes");
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
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    const otherUsers = rooms[roomId].filter(id => id !== socket.id);
    socket.emit("all-users", otherUsers);

    rooms[roomId].push(socket.id);
    socket.join(roomId);

    socket.on("offer", ({ offer, to }) => {
      io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
      io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    });
  });
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

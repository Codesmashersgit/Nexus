const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
require("dotenv").config();
require("./config/passport");
const { Server } = require("socket.io");
const http = require("http");

const authRoutes = require("./Routes/authRoute");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🟢 New socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomID, name }) => {
    socket.join(roomID);
    socket.roomID = roomID;
    socket.userName = name;
    console.log(`👤 ${name} joined room: ${roomID}`);

    socket.to(roomID).emit("user-joined", socket.id);
  });

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", data);
  });

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
    if (socket.roomID) {
      socket.to(socket.roomID).emit("typing", {
        id: socket.id,
        name: data.name,
      });
    }
  });

  socket.on("stop-typing", () => {
    if (socket.roomID) {
      socket.to(socket.roomID).emit("stop-typing", { id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    if (socket.roomID) {
      socket.to(socket.roomID).emit("user-left", socket.id);
      console.log(`${socket.userName || socket.id} left room ${socket.roomID}`);
    }
  });
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));

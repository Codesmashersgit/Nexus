// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./Routes/authRoute");
const passport = require("passport");

require("./config/passport");

const app = express();
const server = http.createServer(app);

// 👉 CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
        console.log(`User ${socket.id} joined room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", socket.id);
    });

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
        io.emit("user-left", socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Signaling server running on http://localhost:${PORT}`);
});

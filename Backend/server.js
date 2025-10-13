
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
const path = require('path');


const { Server } = require("socket.io"); 
const http = require("http");             

const authRoutes = require("./Routes/authRoute");

const app = express();
app.use(cors());
app.use(express.json());

app.use(passport.initialize());


app.use("/api/auth", authRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

 socket.on("join-room", (roomID) => {
  socket.join(roomID);
  socket.to(roomID).emit("user-joined", socket.id);

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", data);
  });

  socket.on("send-message", ({ name, message }) => {
    io.to(roomID).emit("receive-message", {
      id: socket.id,
      name,
      message,
    });
  });

  socket.on("typing", (data) => {
    socket.to(roomID).emit("typing", { id: socket.id, name: data.name });
  });

  socket.on("stop-typing", () => {
    socket.to(roomID).emit("stop-typing", { id: socket.id });
  });

  socket.on("disconnect", () => {
    socket.to(roomID).emit("user-left", socket.id);
    console.log(`Socket ${socket.id} disconnected`);
  });
});

});


// MongoDB connect aur server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,() => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

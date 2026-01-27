
// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");
// const passport = require("passport");
// const authRoutes = require("./Routes/authRoute");

// require("./config/passport");

// const app = express();
// const server = http.createServer(app);

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.error("MongoDB connection error:", err));

// app.use(cors({
//   origin: process.env.VITE_CLIENT_URL || "*", // Allow frontend domain in prod
//   methods: ["GET", "POST"]
// }));
// app.use(express.json());
// app.use(passport.initialize());
// app.use("/api/auth", authRoutes);


// const io = new Server(server, {
//   cors: {
//     origin: process.env.VITE_CLIENT_URL || "*",
//     methods: ["GET", "POST"]
//   }
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join-room", (roomId) => {
//     console.log(`User ${socket.id} joined room ${roomId}`);
//     socket.join(roomId);
//     socket.to(roomId).emit("user-joined", socket.id);
//   });

//   socket.on("offer", ({ offer, to }) => {
//     io.to(to).emit("offer", { offer, from: socket.id });
//   });

//   socket.on("answer", ({ answer, to }) => {
//     io.to(to).emit("answer", { answer, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ candidate, to }) => {
//     io.to(to).emit("ice-candidate", { candidate, from: socket.id });
//   });

//  socket.on("disconnect", () => {
//   socket.rooms.forEach(roomId => {
//     if (roomId !== socket.id) { // ignore default socket room
//       socket.to(roomId).emit("user-left", socket.id);
//     }
//   });
// });



//   });


// if (process.env.NODE_ENV === "production") {
//   const distPath = path.join(__dirname, "client/dist"); // adjust if CRA -> build
//   app.use(express.static(distPath));

//   app.get("/:wildcard(.*)", (req, res) => {
//     res.sendFile(path.join(distPath, "index.html"));
//   });
// }

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ===== Body parser =====
app.use(express.json());

// ===== CORS =====
const FRONTEND_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173"],
  credentials: true
}));

// ===== Socket.IO =====
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"]
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

// ===== REST API example =====
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  res.json({ success: true, email });
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

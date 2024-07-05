import { Server } from "socket.io";
import cors from "cors";
import express from "express";

const app = express();

// Use CORS middleware
app.use(cors({
  origin: "http://localhost:5173", // URL of your frontend
  methods: ["GET", "POST"],         // Allowed methods
  credentials: true                 // Allow cookies and other credentials
}));

const io = new Server(app, {
  cors: {
    origin: "http://localhost:5173", // URL of your frontend
    methods: ["GET", "POST"],
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log(`User ${userId} added with socket ID ${socket.id}`);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log(`Message sent to ${receiverId}`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User disconnected");
  });
});

io.listen(4000);

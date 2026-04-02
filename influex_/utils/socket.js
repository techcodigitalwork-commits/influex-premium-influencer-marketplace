// 🔥 GLOBAL SOCKET INSTANCE
import { Server } from "socket.io";

let io = null;

// init (server se call hoga)
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket Connected:", socket.id);

    socket.on("joinConversation", (convId) => {
      socket.join(convId.toString());
      console.log("📥 Joined room:", convId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected:", socket.id);
    });
  });

  return io;
};

// 🔥 anywhere se use karne ke liye
export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized!");
  }
  return io;
};
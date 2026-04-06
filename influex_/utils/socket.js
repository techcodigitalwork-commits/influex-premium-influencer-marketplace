import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
       transports: ["websocket"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket Connected:", socket.id);

    socket.on("joinConversation", (convId) => {
      socket.join(convId.toString());
      console.log("📥 Joined room:", convId);
    });
  // ✅ MUST ADD THIS
  socket.on("send_message", (data) => {
    console.log("📤 Message received:", data);

    io.to(data.room).emit("receive_message", data);
  });
    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized!");
  }
  return io;
};
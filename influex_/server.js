
import dotenv from "dotenv";
// Load env
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

// Load env
//dotenv.config();

// Routes
import authRoutes from "./Routes/auth.routes.js";
import publicRoutes from "./Routes/public.routes.js";
import metaRoutes from "./Routes/meta.routes.js";
import discoverRoutes from "./Routes/discover.routes.js";
import campaignRoutes from "./Routes/campaign.routes.js";
import reviewRoutes from "./Routes/review.routes.js";
import profileRoutes from "./Routes/profile.routes.js";
import notificationRoutes from "./Routes/notification.routes.js";
import conversationRoutes from "./Routes/conversation.routes.js"; // add this
import s3Routes from "./Routes/s3.routes.js";
import applicationRoutes from "./Routes/application.routes.js";
// Models
import Conversation from "./models/Conversation.js";
import Notification from "./models/notification.js";

// App init
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Influex Backend API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api", s3Routes);
app.use("/api/application", applicationRoutes);
// MongoDB connect + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Create HTTP server
    const server = http.createServer(app);

    // Socket.io setup
    const io = new Server(server, {
      cors: {
        origin: "*", // ya frontend origin
        methods: ["GET", "POST"]
      }
    });

    // Socket.io events
    io.on("connection", socket => {
      console.log("User connected: ", socket.id);

      socket.on("joinRoom", profileId => {
        socket.join(profileId);
        console.log(`User ${profileId} joined room`);
      });

      socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
        if (!text || !conversationId || !senderId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const message = { sender: senderId, text, createdAt: new Date() };
        conversation.messages.push(message);
        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Notify participants
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("receiveMessage", {
            conversationId,
            message
          });

          if (participantId.toString() !== senderId.toString()) {
            io.to(participantId.toString()).emit("newNotification", {
              message: `New message from ${senderId}`,
              conversationId
            });

            Notification.create({
              user: participantId,
              message: `New message from ${senderId}`,
              type: "new_message",
              link: `/chat/${conversationId}`
            });
          }
        });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
      });
    });

   server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.io`);
});

  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });
//import { S3Client } from "@aws-sdk/client-s3";

//export const s3 = new S3Client({
  //region: process.env.AWS_REGION,
//});
//console.log("AWS keys:", process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY, process.env.AWS_REGION);
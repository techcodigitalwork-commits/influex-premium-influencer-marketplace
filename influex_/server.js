
//import dotenv from "dotenv";
// Load env
//dotenv.config();
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
// //console.log("AWS_REGION:", process.env.AWS_REGION);
 console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
// console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "YES" : "NO");
// console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "YES" : "NO");
// console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "YES" : "NO");
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
import subscriptionRoutes from "./Routes/subscription.routes.js";
import dealRoutes from "./Routes/deal.routes.js";
import DeliverableRoutes from "./Routes/Deliverable.routes.js";
import contactRoutes from "./Routes/contact.routes.js";
import contractRoutes from "./Routes/contract.routes.js";
import inviteRoutes from "./Routes/invite.routes.js";
import adminRoutes from "./Routes/admin.routes.js"
import disputeRoutes from "./Routes/dispute.routes.js";
// Models
import Conversation from "./models/Conversation.js";
import Notification from "./models/notification.js";
import { detectContactInfo } from "./utils/contactDetector.js";
import paymentsRoutes from "./Routes/payments.routes.js"

// App init
const app = express();

// Middlewares
app.use(cors());

app.use(morgan("dev"));
app.post(
  "/api/subscription/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());

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
// Mount subscription routes
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/deal",dealRoutes)
app.use("/api/deliverable",DeliverableRoutes)
app.use("/api/contact",contactRoutes)
app.use("/api/contract",contractRoutes)
app.use("/api/invite",inviteRoutes)
app.use("/api/payment",paymentsRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/dispute", disputeRoutes);
// MongoDB connect + server start
const PORT = process.env.PORT || 5000;

// Health check
// app.get("/", (req, res) => {
//   res.send("🚀 Influex Backend API is running");
// });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Create HTTP server
    const server = http.createServer(app);

    // Socket.io setup
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket.io events
    io.on("connection", (socket) => {
      console.log("User connected: ", socket.id);

      socket.on("joinRoom", (profileId) => {
        socket.join(profileId);
        console.log(`User ${profileId} joined room`);
      });

      socket.on("sentMessage", async ({ conversationId, senderId, text }) => {
        if (!text || !conversationId || !senderId) return;

        // Contact detection
        const blocked = detectContactInfo(text);
        if (blocked) {
          socket.emit("messageBlocked", {
            message:
              "Sharing contact information (phone, email, Instagram, WhatsApp) is not allowed. Please communicate inside the platform."
          });
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const message = {
          sender: senderId,
          text,
          createdAt: new Date()
        };

        conversation.messages.push(message);
        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Notify participants
        conversation.participants.forEach((participantId) => {
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

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT} with Socket.io`);
    }).on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use!`);
        process.exit(1);
      }
    });

  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
import crypto from "crypto";
import User from "./models/user.js";
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // ✅ RAW BODY (Buffer)
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(401).send("Invalid signature");
    }

    // ✅ Parse after verify
    const data = JSON.parse(req.body.toString());

    const event = data.event;
    const payload = data.payload;

    let subId = null;

    if (payload.subscription) {
      subId = payload.subscription.entity.id;
    } else if (payload.invoice) {
      subId = payload.invoice.entity.subscription_id;
    }

    if (!subId) return res.status(200).send("No subscription found");

    const user = await User.findOne({ razorpaySubscriptionId: subId });
    if (!user) return res.status(200).send("User not found");

    // ✅ Activate / Renew
    if (event === "subscription.activated" || event === "invoice.paid") {
      user.isSubscribed = true;

      const expiry = payload.subscription?.entity?.current_end;
      user.subscriptionExpiry = expiry
        ? new Date(expiry * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await user.save();
    }

    // ❌ Cancel / Fail
    if (event === "subscription.cancelled" || event === "payment.failed") {
      user.isSubscribed = false;
      await user.save();
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Internal error");
  }
};
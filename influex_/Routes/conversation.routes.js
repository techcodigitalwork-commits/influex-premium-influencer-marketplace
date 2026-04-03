// import express from "express";
// import auth from "../middlewares/auth.middleware.js";
// import { getOrCreateConversation, sendMessage, getMessages,markConversationRead } from "../controllers/conversation.controller.js";
// import Conversation from "../models/Conversation.js";
// const router = express.Router();
// router.get("/my", auth, async (req, res) => {
//   try {
//     const conversations = await Conversation.find({
//       participants: req.user._id
//     })
//       .populate("participants", "name email role profileImage")
//       .populate("campaignId", "title")
//       .sort({ updatedAt: -1 });

//     // 🔥 IMPORTANT FIX
//     const result = conversations.map(conv => ({
//       ...conv.toObject(),
//       unreadCount: conv.unreadCounts?.get(req.user._id.toString()) || 0
//     }));

//     res.json({ success: true, data: result });

//   } catch (err) {
//     console.error("MY CONVERSATIONS ERROR:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// // Create or fetch conversation
// router.post("/create", auth, getOrCreateConversation);

// // Send message
// router.post("/send/:conversationId", auth, sendMessage);

// // Get all messages in conversation
// router.get("/messages/:conversationId", auth, getMessages);
// router.post("/read/:conversationId", auth, markConversationRead);

// export default router;
import express from "express";
import * as chatController from "../controllers/conversation.controller.js";
import auth from "../middlewares/auth.middleware.js";
import Conversation from "../models/Conversation.js";
const router = express.Router();

// ==============================
// INITIATE CHAT
// ==============================
router.post("/initiate", auth, chatController.initiateChat);
router.post("/provider/initiate", auth, chatController.initiateChat);

// ==============================
// SEND MESSAGE
// ==============================
router.post("/send-message", auth, chatController.sendMessage);
router.post("/provider/send-message", auth, chatController.sendMessage);

// ==============================
// GET MESSAGES
// ==============================
router.get("/:chat_id/messages", auth, chatController.getMessages);
router.get("/provider/:chat_id/messages", auth, chatController.getMessages);

// ==============================
// GET BY SERVICE
// ==============================
router.get("/messages/:service_id", auth, chatController.getMessagesbyService);

// ==============================
// GET ALL CHATS
// ==============================
router.get("/user/all", auth, chatController.getAllChats);
router.get("/provider/all", auth, chatController.getAllChats);

export default router;
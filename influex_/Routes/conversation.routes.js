import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getOrCreateConversation, sendMessage, getMessages } from "../controllers/conversation.controller.js";
import Conversation from "../models/Conversation.js";
const router = express.Router();
router.get("/my", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name email role profileImage")
      .populate("campaignId", "title") // optional but useful
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });

  } catch (err) {
    console.error("MY CONVERSATIONS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Create or fetch conversation
router.post("/create", auth, getOrCreateConversation);

// Send message
router.post("/send/:conversationId", auth, sendMessage);

// Get all messages in conversation
router.get("/messages/:conversationId", auth, getMessages);

export default router;

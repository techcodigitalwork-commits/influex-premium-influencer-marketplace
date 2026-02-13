import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getOrCreateConversation, sendMessage, getMessages } from "../controllers/conversation.controller.js";

const router = express.Router();

// Create or fetch conversation
router.post("/create", verifyToken, getOrCreateConversation);

// Send message
router.post("/send/:conversationId", verifyToken, sendMessage);

// Get all messages in conversation
router.get("/messages/:conversationId", verifyToken, getMessages);

export default router;

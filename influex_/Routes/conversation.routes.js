import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getOrCreateConversation, sendMessage, getMessages } from "../controllers/conversation.controller.js";

const router = express.Router();

// Create or fetch conversation
router.post("/create", auth, getOrCreateConversation);

// Send message
router.post("/send/:conversationId", auth, sendMessage);

// Get all messages in conversation
router.get("/messages/:conversationId", auth, getMessages);

export default router;

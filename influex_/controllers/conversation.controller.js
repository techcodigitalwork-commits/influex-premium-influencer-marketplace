import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";
import { detectContactInfo } from "../utils/contactDetector.js";
import mongoose from "mongoose";
import { io } from "../server.js"; // 👈 jaha tera socket init hai


// ==============================
// 1️⃣ GET OR CREATE CONVERSATION
// ==============================
export const getOrCreateConversation = async (req, res) => {
  try {
    const { campaignId, participantId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(campaignId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    let conversation = await Conversation.findOne({
      campaignId,
      participants: { $all: [req.user._id, participantId] }
    }).populate("participants", "name profileImage");

    if (!conversation) {
      conversation = await Conversation.create({
        campaignId,
        participants: [req.user._id, participantId],
        messages: [],
        lastMessage: "",
        lastMessageAt: new Date(),
        unreadCounts: {}
      });

      conversation = await conversation.populate("participants", "name profileImage");
    }

    res.json({ success: true, data: conversation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get/create conversation" });
  }
};



// ==============================
// 2️⃣ SEND MESSAGE + UNREAD COUNT
// ==============================
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message empty" });
    }

    // ❌ Contact detection
    if (detectContactInfo(text)) {
      return res.status(400).json({
        success: false,
        message: "Sharing contact info not allowed"
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const senderId = req.user._id;

    // ✅ Auth check
    if (!conversation.participants.some(p => p.toString() === senderId.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const message = {
      sender: senderId,
      text,
      createdAt: new Date(),
      readBy: [senderId]
    };

    conversation.messages.push(message);
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();

    // 🔥 UNREAD COUNT LOGIC
    conversation.participants.forEach(pId => {
      if (pId.toString() !== senderId.toString()) {
        const current = conversation.unreadCounts.get(pId.toString()) || 0;
        conversation.unreadCounts.set(pId.toString(), current + 1);
      }
    });

    // await conversation.save();
    await conversation.save();

// 🔥 populate sender (frontend ko proper data mile)
const populatedMessage = {
  ...message,
  sender: {
    _id: req.user._id,
    name: req.user.name,
    profileImage: req.user.profileImage
  },
  conversationId: conversation._id
};

// 🔥 REALTIME EMIT (MOST IMPORTANT)
io.to(conversation._id.toString()).emit("newMessage", populatedMessage);

    // 🔔 Notification
    const otherUser = conversation.participants.find(
      p => p.toString() !== senderId.toString()
    );

    await Notification.create({
      user: otherUser,
      message: `New message from ${req.user.name || "User"}`,
      type: "new_message",
      link: `/chat/${conversation._id}`
    });

    res.json({ success: true, data: message });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Send failed" });
  }
};



// ==============================
// 3️⃣ GET MESSAGES
// ==============================
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate("messages.sender", "name profileImage")
      .populate("participants", "name profileImage");

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (!conversation.participants.some(
      p => p._id.toString() === req.user._id.toString()
    )) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: conversation.messages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};



// ==============================
// 4️⃣ MARK AS READ
// ==============================
export const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const userId = req.user._id.toString();

    // ✅ unread count reset
    conversation.unreadCounts.set(userId, 0);

    // ✅ mark all messages as read
    conversation.messages.forEach(msg => {
      if (!msg.readBy.includes(req.user._id)) {
        msg.readBy.push(req.user._id);
      }
    });

    await conversation.save();

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Read failed" });
  }
};



// ==============================
// 5️⃣ GET MY CONVERSATIONS
// ==============================
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name profileImage")
      .sort({ lastMessageAt: -1 });

    const result = conversations.map(conv => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCounts?.get(req.user._id.toString()) || 0
    }));

    res.json({ success: true, data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed" });
  }
};
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";

// 1️⃣ Create or fetch conversation (if already exists)
export const getOrCreateConversation = async (req, res) => {
  try {
    const { campaignId, participantId } = req.body; // participantId = other user

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      campaignId,
      participants: { $all: [req.user.profileId, participantId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        campaignId,
        participants: [req.user.profileId, participantId],
        messages: [],
        lastMessage: "",
        lastMessageAt: new Date()
      });
    }

    res.json({ success: true, data: conversation });

  } catch (error) {
    console.error("Get/Create conversation error:", error);
    res.status(500).json({ success: false, message: "Failed to get or create conversation" });
  }
};

// 2️⃣ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Check if sender is part of conversation
    if (!conversation.participants.includes(req.user.profileId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const message = {
      sender: req.user.profileId,
      text,
      createdAt: new Date()
    };

    conversation.messages.push(message);
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Notify other participant
    const otherParticipant = conversation.participants.find(p => String(p) !== String(req.user.profileId));
    await Notification.create({
      user: otherParticipant,
      message: `New message from ${req.user.name || "Brand/Influencer"}`,
      type: "new_message",
      link: `/chat/${conversation._id}`
    });

    res.json({ success: true, data: message });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// 3️⃣ Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate("messages.sender", "name profileImage")
      .populate("participants", "name profileImage");

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Only participants can view messages
    if (!conversation.participants.some(p => String(p._id) === String(req.user.profileId))) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: conversation.messages });

  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

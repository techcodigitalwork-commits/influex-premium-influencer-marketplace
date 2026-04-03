// import Conversation from "../models/Conversation.js";
// import Notification from "../models/notification.js";
// import { detectContactInfo } from "../utils/contactDetector.js";
// import mongoose from "mongoose";
// import { getIO } from "../utils/socket.js"
// //import io from "../server.js"


// // ==============================
// // 1️⃣ GET OR CREATE CONVERSATION
// // ==============================
// export const getOrCreateConversation = async (req, res) => {
//   try {
//     const { campaignId, participantId } = req.body;

//     if (
//       !mongoose.Types.ObjectId.isValid(campaignId) ||
//       !mongoose.Types.ObjectId.isValid(participantId)
//     ) {
//       return res.status(400).json({ success: false, message: "Invalid ID" });
//     }

//     let conversation = await Conversation.findOne({
//       campaignId,
//       participants: { $all: [req.user._id, participantId] }
//     }).populate("participants", "name profileImage");

//     if (!conversation) {
//       conversation = await Conversation.create({
//         campaignId,
//         participants: [req.user._id, participantId],
//         messages: [],
//         lastMessage: "",
//         lastMessageAt: new Date(),
//         unreadCounts: {}
//       });

//       conversation = await conversation.populate("participants", "name profileImage");
//     }

//     res.json({ success: true, data: conversation });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to get/create conversation" });
//   }
// };



// // ==============================
// // 2️⃣ SEND MESSAGE + UNREAD COUNT
// // ==============================
// export const sendMessage = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const { text } = req.body;

//     if (!text || text.trim() === "") {
//       return res.status(400).json({ success: false, message: "Message empty" });
//     }

//     // ❌ Contact detection
//     if (detectContactInfo(text)) {
//       return res.status(400).json({
//         success: false,
//         message: "Sharing contact info not allowed"
//       });
//     }

//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation) {
//       return res.status(404).json({ success: false, message: "Conversation not found" });
//     }

//     const senderId = req.user._id;

//     // ✅ Auth check
//     if (!conversation.participants.some(p => p.toString() === senderId.toString())) {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }

//     const message = {
//       sender: senderId,
//       text,
//       createdAt: new Date(),
//       readBy: [senderId]
//     };

//     conversation.messages.push(message);
//     conversation.lastMessage = text;
//     conversation.lastMessageAt = new Date();

//     // 🔥 UNREAD COUNT LOGIC
//     conversation.participants.forEach(pId => {
//       if (pId.toString() !== senderId.toString()) {
//         const current = conversation.unreadCounts.get(pId.toString()) || 0;
//         conversation.unreadCounts.set(pId.toString(), current + 1);
//       }
//     });

//     // await conversation.save();
//     await conversation.save();

// // 🔥 populate sender (frontend ko proper data mile)
// const populatedMessage = {
//   ...message,
//   sender: {
//     _id: req.user._id,
//     name: req.user.name,
//     profileImage: req.user.profileImage
//   },
//   conversationId: conversation._id
// };

// // 🔥 REALTIME EMIT (MOST IMPORTANT)
// getIO().to(conversation._id.toString()).emit("newMessage", populatedMessage);

//     // 🔔 Notification
//     const otherUser = conversation.participants.find(
//       p => p.toString() !== senderId.toString()
//     );

//     await Notification.create({
//       user: otherUser,
//       message: `New message from ${req.user.name || "User"}`,
//       type: "new_message",
//       link: `/chat/${conversation._id}`
//     });

//     res.json({ success: true, data: message });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Send failed" });
//   }
// };



// // ==============================
// // 3️⃣ GET MESSAGES
// // ==============================
// export const getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.params;

//     const conversation = await Conversation.findById(conversationId)
//       .populate("messages.sender", "name profileImage")
//       .populate("participants", "name profileImage");

//     if (!conversation) {
//       return res.status(404).json({ success: false, message: "Not found" });
//     }

//     if (!conversation.participants.some(
//       p => p._id.toString() === req.user._id.toString()
//     )) {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }

//     res.json({ success: true, data: conversation.messages });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Fetch failed" });
//   }
// };



// // ==============================
// // 4️⃣ MARK AS READ
// // ==============================
// export const markConversationRead = async (req, res) => {
//   try {
//     const { conversationId } = req.params;

//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation) {
//       return res.status(404).json({ success: false, message: "Not found" });
//     }

//     const userId = req.user._id.toString();

//     // ✅ unread count reset
//     conversation.unreadCounts.set(userId, 0);

//     // ✅ mark all messages as read
//     conversation.messages.forEach(msg => {
//       if (!msg.readBy.includes(req.user._id)) {
//         msg.readBy.push(req.user._id);
//       }
//     });

//     await conversation.save();

//     res.json({ success: true });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Read failed" });
//   }
// };



// // ==============================
// // 5️⃣ GET MY CONVERSATIONS
// // ==============================
// export const getMyConversations = async (req, res) => {
//   try {
//     const conversations = await Conversation.find({
//       participants: req.user._id
//     })
//       .populate("participants", "name profileImage")
//       .sort({ lastMessageAt: -1 });

//     const result = conversations.map(conv => ({
//       ...conv.toObject(),
//       unreadCount: conv.unreadCounts?.get(req.user._id.toString()) || 0
//     }));

//     res.json({ success: true, data: result });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed" });
//   }
// };
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";
import { getIO } from "../utils/socket.js";
import { detectContactInfo } from "../utils/contactDetector.js";
import Conversation from "../models/Conversation.js";

// ==============================
// 1️⃣ INITIATE CHAT
// ==============================
export const initiateChat = async (req, res) => {
  try {
    const user_id = req.user?._id;
    const { service_id, provider_id } = req.body;

    if (!service_id || !provider_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let chat = await Conversation.findOne({
      service_id,
      participants: { $all: [user_id, provider_id] }
    });

    if (!chat) {
      chat = await Conversation.create({
        service_id,
        participants: [user_id, provider_id],
        messages: [],
        lastMessage: "",
        lastMessageAt: new Date(),
        unreadCounts: {}
      });
    }

    return res.json({ success: true, chat });

  } catch (err) {
    console.error("❌ Error initiating chat:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// 2️⃣ SEND MESSAGE
// ==============================
export const sendMessage = async (req, res) => {
  try {
    const { chat_id, message } = req.body;
    const sender_id = req.user?._id;

    if (!chat_id || !message || !sender_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (detectContactInfo(message)) {
      return res.status(400).json({
        success: false,
        message: "Sharing contact info not allowed"
      });
    }

    const chat = await Conversation.findById(chat_id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const msg = {
      sender: sender_id,
      text: message,
      createdAt: new Date(),
      readBy: [sender_id]
    };

    chat.messages.push(msg);
    chat.lastMessage = message;
    chat.lastMessageAt = new Date();

    // 🔥 UNREAD COUNT
    chat.participants.forEach(p => {
      if (p.toString() !== sender_id.toString()) {
        const count = chat.unreadCounts.get(p.toString()) || 0;
        chat.unreadCounts.set(p.toString(), count + 1);
      }
    });

    await chat.save();

    // 🔥 SOCKET EMIT
    getIO().to(chat._id.toString()).emit("receive_message", {
      chat_id: chat._id,
      message: msg
    });

    // 🔔 Notification
    const otherUser = chat.participants.find(
      p => p.toString() !== sender_id.toString()
    );

    await Notification.create({
      user: otherUser,
      message: `New message`,
      type: "new_message",
      link: `/chat/${chat._id}`
    });

    res.json({ success: true, message: msg });

  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==============================
// 3️⃣ GET MESSAGES
// ==============================
export const getMessages = async (req, res) => {
  try {
    const { chat_id } = req.params;

    const chat = await Conversation.findById(chat_id)
      .populate("messages.sender", "name profileImage");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // mark read
    chat.messages.forEach(msg => {
      if (!msg.readBy.includes(req.user._id)) {
        msg.readBy.push(req.user._id);
      }
    });

    chat.unreadCounts.set(req.user._id.toString(), 0);

    await chat.save();

    res.json({ success: true, messages: chat.messages });

  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==============================
// 4️⃣ GET ALL CHATS
// ==============================
export const getAllChats = async (req, res) => {
  try {
    const user_id = req.user?._id;

    const chats = await Conversation.find({
      participants: user_id
    }).sort({ lastMessageAt: -1 });

    const result = chats.map(chat => ({
      ...chat.toObject(),
      unread_count: chat.unreadCounts?.get(user_id.toString()) || 0
    }));

    res.json({ success: true, chats: result });

  } catch (err) {
    console.error("❌ Error fetching chats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==============================
// 5️⃣ CLOSE CHAT
// ==============================
export const closeChat = async (req, res) => {
  try {
    const { chat_id } = req.body;

    await Conversation.findByIdAndUpdate(chat_id, {
      status: "closed"
    });

    getIO().to(chat_id).emit("chat_closed", { chat_id });

    res.json({ success: true, message: "Chat closed" });

  } catch (err) {
    console.error("❌ Error closing chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getMessagesbyService = async (req, res) => {
  try {
    const { service_id } = req.params;

    // service_id se conversation find
    const conversation = await Conversation.findOne({ service_id })
      .populate("messages.sender", "name profileImage");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Chat not found for this service",
      });
    }

    res.json({
      success: true,
      messages: conversation.messages,
    });

  } catch (error) {
    console.error("❌ Error fetching messages by service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const conversationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },

  // 🔥 ADD THIS (tera route ke liye)
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],

  messages: [messageSchema],

  lastMessage: String,

  lastMessageAt: Date,

  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }

}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
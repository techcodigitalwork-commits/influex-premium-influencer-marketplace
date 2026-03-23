import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  
    {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
   sender: {   // 🔥 important
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
    message: {
      type: String,
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null
    },
    type: {
      type: String,
      enum: [
  "invite",
  "invite_response",
  "application",
  "application_accepted",
  "application_rejected",
   "new_application",
  "message",
  "campaign_update",
  "payment",
  "new_message"
],
      default: "application_accepted"
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String // optional, frontend me redirect karne ke liye, eg. chat link
    },
    data: {
  type: Object,
  default: {}
}
  },
  { timestamps: true }
);
// 🔥 indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });


export default mongoose.model("Notification", notificationSchema);

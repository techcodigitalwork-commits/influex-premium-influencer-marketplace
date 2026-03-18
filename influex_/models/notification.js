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
        "application_accepted",
        "new_message",
         "application_rejected",
        "campaign_update",
       "new_application",
          "invite",
      "invite_response",
      "application",
      "message",
      "payment"
      ],
      default: "application_accepted"
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String // optional, frontend me redirect karne ke liye, eg. chat link
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);

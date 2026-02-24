import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile", // ya "User", jo tumhare frontend me use ho raha ho
      required: true
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
        "campaign_update",
       "new_application"
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

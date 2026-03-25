import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // 🔥 videos
  urls: [
    {
      type: String,
    }
  ],

  // 🔥 images bhi add kar diye
  images: [
    {
      type: String,
    }
  ],

  caption: {
    type: String,
    default: "",
  },

}, { timestamps: true });

export default mongoose.model("Video", videoSchema);
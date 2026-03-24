import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  urls: [String], // multiple videos
  caption: String,
}, { timestamps: true });

export default mongoose.model("Video", videoSchema);
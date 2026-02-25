import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    profileImage: String,

    followers: {
      type: String,   // 🔥 String mat rakho
      default: 0,
      min: 0
    },

    role: {
      type: String,
      enum: ["influencer", "brand"]
    },

    name: String,
    bio: String,
    location: String,

    // Influencer specific
    categories: [String],   // 🔥 array better hai
    platform: String,

    // Brand specific
    companyName: String,
    website: String,
    industry: String,
    phone: {
    type: String,
   // required: true,
    match: /^[0-9+]{10,15}$/
}
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
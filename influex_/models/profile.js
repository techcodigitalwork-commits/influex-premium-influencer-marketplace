import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    role: {
      type: String,
      enum: ["influencer", "brand", "photographer"],
      required: true
    },

    name: {
      type: String,
      required: true
    },

    bio: String,
    location: String,
    profileImage: String,

    // Influencer specific
    categories: [String],
    followers: Number,
    platform: String, // Instagram, YouTube etc

    // Brand specific
    companyName: String,
    website: String,

    // Photographer specific
    experience: Number,
    portfolioLink: String
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

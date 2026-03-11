import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },

  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending","accepted","rejected"],
    default: "pending"
  }

},{timestamps:true})

export default mongoose.model("Invite",inviteSchema)
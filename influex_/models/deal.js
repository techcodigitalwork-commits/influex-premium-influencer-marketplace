import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign"
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  amount: Number,

  platformCommission: Number,

  creatorAmount: Number,

  paymentStatus: {
    type: String,
    enum: ["pending", "deposited", "released", "refunded"],
    default: "pending"
  },

  workStatus: {
    type: String,
    enum: ["not_started", "submitted", "approved"],
    default: "not_started"
  },

  paymentId: String

}, { timestamps: true });

export default mongoose.model("Deal", dealSchema);
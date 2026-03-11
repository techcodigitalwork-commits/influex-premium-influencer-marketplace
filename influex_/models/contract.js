import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const contractSchema = new mongoose.Schema({

  dealId: {
    type: ObjectId,
    ref: "Deal"
  },

  brandId: {
    type: ObjectId,
    ref: "User"
  },

  influencerId: {
    type: ObjectId,
    ref: "User"
  },

  deliverables: String,

  timeline: String,

  amount: Number,

  status: {
    type: String,
    enum: ["pending", "signed"],
    default: "pending"
  }

});

export default mongoose.model("Contract", contractSchema);
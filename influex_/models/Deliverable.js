import mongoose from "mongoose";

const DeliverableSchema = new mongoose.Schema({

  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal"
  },

  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  links: [String],

  note: String,

  status: {
    type: String,
    enum: ["submitted", "approved", "rejected"],
    default: "submitted"
  }

}, { timestamps: true });

export default mongoose.model("Deliverable", DeliverableSchema);
const contractSchema = new mongoose.Schema({

  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal"
  },

  brandId: ObjectId,

  influencerId: ObjectId,

  deliverables: String,

  timeline: String,

  amount: Number,

  status: {
    type: String,
    enum: ["pending", "signed"],
    default: "pending"
  }

});

export const Contract = mongoose.model("contract", contractSchema);
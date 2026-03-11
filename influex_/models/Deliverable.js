const DeliverableSchema = new mongoose.Schema({

  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal"
  },

  creatorId: {
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
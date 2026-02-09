// models/Application.js
const applicationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  message: String,

  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING"
  }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);

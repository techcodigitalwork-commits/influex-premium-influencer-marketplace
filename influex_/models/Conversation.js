// models/Conversation.js
const convoSchema = new mongoose.Schema({
  campaignId: mongoose.Schema.Types.ObjectId,
  participants: [mongoose.Schema.Types.ObjectId]
});

export default mongoose.model("Conversation", convoSchema);

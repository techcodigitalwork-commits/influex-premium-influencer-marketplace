import mongoose from "mongoose";

const contactUnlockSchema = new mongoose.Schema({

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  unlockedAt: {
    type: Date,
    default: Date.now
  }

})

export default mongoose.model("ContactUnlock", contactUnlockSchema)
import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({

  dealId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Deal"
  },

  brandId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  influencerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  amount:Number,

  commission:Number,

  creatorAmount:Number,

  status:{
    type:String,
    enum:["pending","funded","released"],
    default:"pending"
  }

},{timestamps:true})

export default mongoose.model("Escrow",escrowSchema)
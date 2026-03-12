import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({

  dealId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Deal",
    required:true
  },

  brandId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  influencerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  amount:{
    type:Number,
    required:true
  },

  commission:{
    type:Number,
    required:true
  },

  creatorAmount:{
    type:Number,
    required:true
  },

  orderId:{
    type:String     // Razorpay order id
  },

  paymentId:{
    type:String     // Razorpay payment id
  },

  releaseDate:{
    type:Date
  },

  status:{
    type:String,
    enum:["pending","funded","released","refunded"],
    default:"pending"
  }

},{timestamps:true})

export default mongoose.model("Escrow",escrowSchema)
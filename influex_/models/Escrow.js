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

  // 💰 total paid by brand
  amount:{
    type:Number,
    required:true
  },

  // 🏦 platform commission
  commission:{
    type:Number,
    required:true
  },

  // 👤 creator payout amount
  creatorAmount:{
    type:Number,
    required:true
  },

  // =========================
  // 💳 PAYMENT DETAILS
  // =========================

  orderId:{
    type:String   // Razorpay order id
  },

  paymentId:{
    type:String   // Razorpay payment id
  },

  paymentSignature:{
    type:String   // for verification
  },

  paymentMethod:{
    type:String   // card / upi / netbanking
  },

  // =========================
  // 💸 PAYOUT DETAILS
  // =========================

  payoutId:{
    type:String   // Razorpay payout id
  },

  fundAccountId:{
    type:String   // creator fund account id
  },

  payoutStatus:{
    type:String,
    enum:["pending","processing","processed","failed"],
    default:"pending"
  },

  payoutFailureReason:{
    type:String
  },

  // =========================
  // 📅 TIMESTAMPS
  // =========================

  fundedAt:{
    type:Date
  },

  releaseDate:{
    type:Date
  },

  refundedAt:{
    type:Date
  },

  // =========================
  // 🔄 STATUS FLOW
  // =========================

  status:{
    type:String,
    enum:[
      "pending",     // created
      "funded",      // payment done
      "processing",  // payout started
      "released",    // payout success
      "failed",      // payout failed
      "refunded"     // refund done
    ],
    default:"pending"
  },

  // =========================
  // 🧾 EXTRA METADATA
  // =========================

  notes:{
    type:Object
  }

},{timestamps:true});

export default mongoose.model("Escrow",escrowSchema);
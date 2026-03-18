import Escrow from "../models/Escrow.js"
import Deliverable from "../models/Deliverable.js"
import mongoose from "mongoose"
import Razorpay from "razorpay"
import crypto from "crypto"
import Deal from "../models/deal.js"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})


// =====================================
// CREATE PAYMENT ORDER
// =====================================
export const depositPayment = async (req,res)=>{
  try{

    const {dealId} = req.body

    if(!mongoose.Types.ObjectId.isValid(dealId)){
      return res.status(400).json({message:"Invalid dealId"})
    }

    const deal = await Deal.findById(dealId)

    if(!deal){
      return res.status(404).json({message:"Deal not found"})
    }

    // 🔥 ensure only brand can pay
    if(deal.brandId.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized"})
    }

    const order = await razorpay.orders.create({
      amount: deal.amount * 100,
      currency: "INR",
      receipt: dealId.toString()
    })

    res.json({
      success:true,
      order
    })

  }catch(err){
    console.log("DEPOSIT ERROR:", err)
    res.status(500).json({message:err.message})
  }
}


// =====================================
// VERIFY PAYMENT & CREATE ESCROW
// =====================================
export const verifyPayment = async (req,res)=>{
  try{

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dealId
    } = req.body

    if(!mongoose.Types.ObjectId.isValid(dealId)){
      return res.status(400).json({message:"Invalid dealId"})
    }

    const deal = await Deal.findById(dealId)

    if(!deal){
      return res.status(404).json({message:"Deal not found"})
    }

    // 🔥 security: influencerId DB se lo
    const influencerId = deal.influencerId

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")

    if(expectedSignature !== razorpay_signature){
      return res.status(400).json({
        message:"Payment verification failed"
      })
    }

    // 🔥 prevent duplicate escrow
    const existing = await Escrow.findOne({dealId})
    if(existing){
      return res.status(400).json({
        message:"Escrow already exists"
      })
    }

    const amount = deal.amount
    const commission = amount * 0.10
    const creatorAmount = amount - commission

    // ✅ create escrow
    const escrow = await Escrow.create({
      dealId,
      brandId: req.user._id,
      influencerId,
      amount,
      commission,
      creatorAmount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status:"funded"
    })

    // ✅ update deal (CRITICAL)
    await Deal.findByIdAndUpdate(dealId,{
      paymentStatus:"deposited",
      workStatus:"not_started",
      paymentId: razorpay_payment_id
    })

    res.json({
      success:true,
      escrow
    })

  }catch(err){
    console.log("VERIFY ERROR:", err)
    res.status(500).json({message:err.message})
  }
}


// =====================================
// APPROVE DELIVERABLE & RELEASE PAYMENT
// =====================================
export const approveDeliverable = async (req,res)=>{
  try{

    const {deliverableId} = req.body

    if(!mongoose.Types.ObjectId.isValid(deliverableId)){
      return res.status(400).json({message:"Invalid deliverableId"})
    }

    const deliverable = await Deliverable.findById(deliverableId)

    if(!deliverable){
      return res.status(404).json({
        message:"Deliverable not found"
      })
    }

    const deal = await Deal.findById(deliverable.dealId)

    if(!deal){
      return res.status(404).json({
        message:"Deal not found"
      })
    }

    // 🔥 only brand can approve
    if(deal.brandId.toString() !== req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      })
    }

    const escrow = await Escrow.findOne({
      dealId: deliverable.dealId
    })

    if(!escrow){
      return res.status(404).json({
        message:"Escrow not found"
      })
    }

    if(escrow.status === "released"){
      return res.status(400).json({
        message:"Payment already released"
      })
    }

    // ✅ approve deliverable
    deliverable.status = "approved"
    await deliverable.save()

    // ✅ release escrow
    escrow.status = "released"
    escrow.releaseDate = new Date()
    await escrow.save()

    // ✅ update deal
    await Deal.findByIdAndUpdate(deliverable.dealId,{
      paymentStatus:"released",
      workStatus:"approved"
    })

    res.json({
      success:true,
      message:"Payment released to creator",
      creatorPaid: escrow.creatorAmount,
      platformCommission: escrow.commission
    })

  }catch(err){
    console.log("APPROVE ERROR:", err)
    res.status(500).json({message:err.message})
  }
}
import Escrow from "../models/Escrow.js"
import Deliverable from "../models/Deliverable.js"
import mongoose from "mongoose"
import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID,
 key_secret: process.env.RAZORPAY_KEY_SECRET
})


// =====================================
// CREATE PAYMENT ORDER
// =====================================

export const depositPayment = async (req,res)=>{
 try{

 const {dealId, amount} = req.body

 if(!mongoose.Types.ObjectId.isValid(dealId)){
  return res.status(400).json({message:"Invalid dealId"})
 }

 const existing = await Escrow.findOne({dealId})

 if(existing){
  return res.status(400).json({
   message:"Escrow already funded"
  })
 }

 const order = await razorpay.orders.create({
   amount: amount * 100,
   currency: "INR",
   receipt: dealId
 })

 res.json({
   success:true,
   order
 })

 }catch(err){
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
  dealId,
  influencerId,
  amount
 } = req.body

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

 const existing = await Escrow.findOne({dealId})

 if(existing){
  return res.status(400).json({
   message:"Escrow already exists"
  })
 }

 const commission = amount * 0.10
 const creatorAmount = amount - commission

 const escrow = await Escrow.create({
  dealId,
  brandId:req.user._id,
  influencerId,
  amount,
  commission,
  creatorAmount,
  orderId: razorpay_order_id,
  paymentId: razorpay_payment_id,
  status:"funded"
 })

 res.json({
  success:true,
  escrow
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}


// =====================================
// APPROVE DELIVERABLE & RELEASE PAYMENT
// =====================================

export const approveDeliverable = async (req,res)=>{
 try{

 const {deliverableId} = req.body

 const deliverable = await Deliverable.findById(deliverableId)

 if(!deliverable){
  return res.status(404).json({
   message:"Deliverable not found"
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

 deliverable.status = "approved"
 await deliverable.save()

 escrow.status = "released"
 escrow.releaseDate = new Date()

 await escrow.save()

 res.json({
  success:true,
  message:"Payment released to creator",
  creatorPaid: escrow.creatorAmount,
  platformCommission: escrow.commission
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
import Escrow from "../models/Escrow.js"
import Deliverable from "../models/Deliverable.js"
import mongoose from "mongoose"

// =====================================
// DEPOSIT PAYMENT
// =====================================

export const depositPayment = async (req,res)=>{
 try{

 const {dealId,influencerId,amount} = req.body

 if(!mongoose.Types.ObjectId.isValid(dealId)){
  return res.status(400).json({message:"Invalid dealId"})
 }

 // check existing escrow
 const existing = await Escrow.findOne({dealId})
 if(existing){
  return res.status(400).json({
   message:"Escrow already funded"
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
// RELEASE PAYMENT
// =====================================

export const releasePayment = async(req,res)=>{
 try{

 const {dealId} = req.body

 const escrow = await Escrow.findOne({dealId})

 if(!escrow){
  return res.status(404).json({message:"Escrow not found"})
 }

 escrow.status = "released"
 await escrow.save()

 res.json({
  creatorPaid: escrow.creatorAmount,
  platformCommission: escrow.commission
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}


// =====================================
// APPROVE DELIVERABLE
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

 deliverable.status = "approved"
 await deliverable.save()

 const escrow = await Escrow.findOne({
  dealId: deliverable.dealId
 })

 if(!escrow){
  return res.status(404).json({
   message:"Escrow not found"
  })
 }

 escrow.status = "released"
 await escrow.save()

 res.json({
  success:true,
  message:"Payment released to creator"
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
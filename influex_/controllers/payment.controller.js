import Escrow from "../models/Escrow.js"
import Deliverable from "../models/Deliverable.js"

export const depositPayment = async(req,res)=>{

 try{

 const {dealId,influencerId,amount} = req.body

 const commission = amount * 0.10
 const creatorAmount = amount - commission

 const escrow = await Escrow.create({

  dealId,
  brandId:req.user.id,
 influencerId,
  amount,
  commission,
  creatorAmount,
  status:"funded"

 })

 res.json(escrow)

 }catch(err){
  res.status(500).json({message:err.message})
 }

}
export const releasePayment = async(req,res)=>{

 const {dealId} = req.body

 const escrow = await Escrow.findOne({dealId})

 escrow.status = "released"

 await escrow.save()

 res.json({
  creatorPaid: escrow.creatorAmount,
  platformCommission: escrow.commission
 })

}
export const approveDeliverable = async (req,res)=>{

 const {deliverableId} = req.body

 const deliverable = await Deliverable.findById(deliverableId)

 deliverable.status = "approved"

 await deliverable.save()

 const escrow = await Escrow.findOne({dealId:deliverable.dealId})

 escrow.status = "released"

 await escrow.save()

 res.json({
  message:"Payment released to creator"
 })

}
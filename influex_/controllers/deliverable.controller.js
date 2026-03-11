import Deliverable  from "../models/Deliverable.js"
import Escrow from "../models/Escrow.js"
export const submitWork = async (req,res)=>{

 try{

 const {dealId,links,note} = req.body

 const deliverable = await Deliverable.create({
   dealId,
   influencerId:req.user._id,
   links,
   note
 })

 res.json(deliverable)

 }catch(err){
  res.status(500).json({message:err.message})
 }

}
export const approveDeliverable = async (req,res)=>{

 const {deliverableId} = req.body

 const deliverable = await Deliverable.findById(deliverableId)

 deliverable.status = "approved"

 await deliverable.save()

 
  const escrow = await Escrow.findOne({ dealId: deliverable.dealId })

 escrow.status = "released"
 await escrow.save()

 // reward creator
 await rewardCreator(deliverable.creatorId)

 res.json({
  message:"Payment released and creator rewarded"
 })

}
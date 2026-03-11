import Deliverable  from "../models/Deliverable.js"

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

 res.json({message:"Deliverable approved"})

}
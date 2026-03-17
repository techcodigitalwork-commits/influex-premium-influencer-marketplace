import Dispute from "../models/dispute.js";

export const raiseDispute = async(req,res)=>{
 try{

 const {dealId,reason,description} = req.body

 const dispute = await Dispute.create({
  dealId,
  raisedBy:req.user._id,
  reason,
  description
 })

 res.json({
  success:true,
  dispute
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
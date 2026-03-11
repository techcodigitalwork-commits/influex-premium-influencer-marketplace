import Deal from "../models/deal.js"

export const createDeal = async (req,res)=>{
 try{

 const {campaignId, creatorId, amount} = req.body

 const commission = amount * 0.10
 const creatorAmount = amount - commission

 const deal = await Deal.create({
   campaignId,
   creatorId,
   brandId:req.user.id,
   amount,
   platformCommission:commission,
   creatorAmount
 })

 res.json(deal)

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const depositPayment = async (req,res)=>{

 const {dealId} = req.body

 const deal = await Deal.findById(dealId)

 deal.paymentStatus = "deposited"

 await deal.save()

 res.json({message:"Payment deposited"})
}
export const approveWork = async (req,res)=>{

 const {dealId} = req.body

 const deal = await Deal.findById(dealId)

 deal.workStatus = "approved"
 deal.paymentStatus = "released"

 await deal.save()

 res.json({message:"Payment released"})
}
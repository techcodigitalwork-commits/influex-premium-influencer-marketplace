import Deal from "../models/deal.js"

export const createDeal = async (req,res)=>{
 try{

 const {campaignId, influencerId , amount} = req.body

 const commission = amount * 0.10
 const creatorAmount = amount - commission

 const deal = await Deal.create({
   campaignId,
   influencerId,
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
export const getMyDeals = async (req,res)=>{
 try{

 let deals

 if(req.user.role === "brand"){
   deals = await Deal.find({
     brandId:req.user._id
   }).populate("influencerId","username email")
 }

 if(req.user.role === "influencer"){
   deals = await Deal.find({
     influencerId:req.user._id
   }).populate("campaignId","title budget")
 }

 res.json({
   success:true,
   data:deals
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const getDealById = async (req,res)=>{
 try{

 const {id} = req.params

 const deal = await Deal.findById(id)
   .populate("campaignId")
   .populate("brandId","username email")
   .populate("influencerId","username email")

 if(!deal){
  return res.status(404).json({
   message:"Deal not found"
  })
 }

 res.json(deal)

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const getCampaignDeals = async (req,res)=>{
 try{

 const {campaignId} = req.params

 const deals = await Deal.find({
   campaignId
 }).populate("influencerId","username email")

 res.json(deals)

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
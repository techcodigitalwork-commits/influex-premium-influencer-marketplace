import Deal from "../models/deal.js"
import Deliverable from "../models/Deliverable.js"


// =====================================
// CREATE DEAL
// =====================================
export const createDeal = async (req,res)=>{
  try{

    const {campaignId, influencerId , amount} = req.body

    const commission = amount * 0.10
    const creatorAmount = amount - commission

    const deal = await Deal.create({
      campaignId,
      influencerId,
      brandId:req.user._id,
      amount,
      platformCommission:commission,
      creatorAmount,

      // 🔥 DEFAULT STATES (VERY IMPORTANT)
      paymentStatus: "pending",
      workStatus: "not_started"
    })

    res.json(deal)

  }catch(err){
    res.status(500).json({message:err.message})
  }
}


// =====================================
// DEPOSIT PAYMENT
// =====================================
export const depositPayment = async (req,res)=>{
  try{

    const {dealId} = req.body

    const deal = await Deal.findById(dealId)

    if(!deal){
      return res.status(404).json({message:"Deal not found"})
    }

    // 🔥 only brand allowed
    if(deal.brandId.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized"})
    }

    deal.paymentStatus = "deposited"
    deal.workStatus = "not_started"

    await deal.save()

    res.json({message:"Payment deposited"})

  }catch(err){
    res.status(500).json({message:err.message})
  }
}


// =====================================
// APPROVE WORK
// =====================================
export const approveWork = async (req,res)=>{
  try{

    const {dealId} = req.body

    const deal = await Deal.findById(dealId)

    if(!deal){
      return res.status(404).json({message:"Deal not found"})
    }

    // 🔥 only brand allowed
    if(deal.brandId.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized"})
    }

    deal.workStatus = "approved"
    deal.paymentStatus = "released"

    await deal.save()

    res.json({message:"Payment released"})

  }catch(err){
    res.status(500).json({message:err.message})
  }
}


// =====================================
// GET MY DEALS
// =====================================
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


// =====================================
// GET DEAL BY ID (FIXED)
// =====================================
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

    // 🔥 FIXED (outside if)
    const deliverable = await Deliverable
      .findOne({ dealId: id })
      .sort({ createdAt: -1 })

    res.json({
      ...deal.toObject(),
      deliverable: deliverable || null
    })

  }catch(err){
    res.status(500).json({message:err.message})
  }
}


// =====================================
// GET CAMPAIGN DEALS
// =====================================
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
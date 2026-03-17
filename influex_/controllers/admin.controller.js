import User from "../models/user.js"
import Campaign from "../models/Campaign.js"
import Deal from "../models/deal.js"
import Escrow from "../models/Escrow.js"
import Deliverable from "../models/Deliverable.js"
import Application from "../models/application.js"
import Review from "../models/review.js"
import Dispute from "../models/dispute.js";
import Profile from "../models/profile.js"


//////////////////////////////////////////////////////
// DASHBOARD STATS
//////////////////////////////////////////////////////

export const getDashboardStats = async(req,res)=>{
 try{

 const totalUsers = await User.countDocuments()
 const totalCampaigns = await Campaign.countDocuments()
 const totalDeals = await Deal.countDocuments()
 const totalDeliverables = await Deliverable.countDocuments()

 const totalRevenue = await Escrow.aggregate([
  {
   $group:{
    _id:null,
    total:{$sum:"$amount"}
   }
  }
 ])

 res.status(200).json({
  success:true,
  stats:{
   users:totalUsers,
   campaigns:totalCampaigns,
   deals:totalDeals,
   deliverables:totalDeliverables,
   revenue:totalRevenue[0]?.total || 0
  }
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

//////////////////////////////////////////////////////
// USERS
//////////////////////////////////////////////////////

export const getAllUsers = async(req,res)=>{
 try{

 const users = await User.find().select("-passwordHash") .populate({
        path: "profile",
        select: "name bio location profileImage followers categories platform companyName"
      });
       

 res.status(200).json({
  success:true,
  users
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

export const banUser = async(req,res)=>{
 try{

 const {id} = req.params

 const user = await User.findByIdAndUpdate(
  id,
  { isActive: false },
  {new:true}
 )

 res.status(200).json({
  success:true,
  message:"User banned",
  user
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

export const deleteUser = async(req,res)=>{
 try{

 const {id} = req.params

 await User.findByIdAndDelete(id)

 res.status(200).json({
  success:true,
  message:"User deleted"
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

//////////////////////////////////////////////////////
// CAMPAIGNS
//////////////////////////////////////////////////////

export const getAllCampaigns = async(req,res)=>{
 try{

 const campaigns = await Campaign.find()
  .populate("brandId","name email")

 res.status(200).json({
  success:true,
  campaigns
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

export const deleteCampaign = async(req,res)=>{
 try{

 const {id} = req.params

 await Campaign.findByIdAndDelete(id)

 res.status(200).json({
  success:true,
  message:"Campaign deleted"
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

//////////////////////////////////////////////////////
// DEALS
//////////////////////////////////////////////////////

export const getAllDeals = async(req,res)=>{
 try{

 const deals = await Deal.find()
  .populate("campaignId")
  .populate("brandId","name")
  .populate("influencerId","name")

 res.status(200).json({
  success:true,
  deals
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

//////////////////////////////////////////////////////
// ESCROW PAYMENTS
//////////////////////////////////////////////////////

export const getEscrows = async(req,res)=>{
 try{

 const escrows = await Escrow.find()
  .populate("brandId","name")
  .populate("influencerId","name")

 res.status(200).json({
  success:true,
  escrows
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}

//////////////////////////////////////////////////////
// DELIVERABLES
//////////////////////////////////////////////////////

export const getDeliverables = async(req,res)=>{
 try{

 const deliverables = await Deliverable.find()
  .populate("dealId")

 res.status(200).json({
  success:true,
  deliverables
 })

 }catch(error){
  res.status(500).json({success:false,message:error.message})
 }
}
export const getInfluencers = async(req,res)=>{
 const influencers = await User.find({role:"influencer"})
 res.json(influencers)
}

export const getBrands = async(req,res)=>{
 const brands = await User.find({role:"brand"})
 res.json(brands)
}
export const pauseCampaign = async(req,res)=>{
 const {id} = req.params

 const campaign = await Campaign.findByIdAndUpdate(
  id,
  {status:"paused"},
  {new:true}
 )

 res.json({
  success:true,
  campaign
 })
}

export const getApplications = async(req,res)=>{
 const applications = await Application.find()
  .populate("campaignId")
  .populate("influencerId")

 res.json({
  success:true,
  applications
 })
}


export const getReviews = async(req,res)=>{
 const reviews = await Review.find()
  .populate("reviewer")
  .populate("targetUser")

 res.json({
  success:true,
  reviews
 })
}

export const deleteReview = async(req,res)=>{
 await Review.findByIdAndDelete(req.params.id)

 res.json({
  success:true,
  message:"Review removed"
 })
}
export const getTransactions = async (req,res)=>{
 try{

 const transactions = await Escrow.find()
  .populate("brandId","name email")
  .populate("influencerId","name email")
  .populate("dealId")

 res.status(200).json({
  success:true,
  transactions
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const getRevenue = async(req,res)=>{
 try{

 const revenue = await Escrow.aggregate([
  {
   $group:{
    _id:null,
    totalRevenue:{$sum:"$commission"}
   }
  }
 ])

 res.json({
  revenue:revenue[0]?.totalRevenue || 0
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const getDisputes = async(req,res)=>{
 try{

 const disputes = await Dispute.find()
  .populate("dealId")
  .populate("raisedBy","name")

 res.json({
  success:true,
  disputes
 })
getDisputes
 }catch(err){
  res.status(500).json({message:err.message})
 }
}
// admin.controller.js

export const refundEscrow = async(req,res)=>{
 const {escrowId} = req.params

 const escrow = await Escrow.findByIdAndUpdate(
  escrowId,
  {status:"refunded"},
  {new:true}
 )

 res.json({
  success:true,
  message:"Payment refunded",
  escrow
 })
}
export const releasePayment = async(req,res)=>{
 try{

 const {escrowId} = req.params

 const escrow = await Escrow.findByIdAndUpdate(
  escrowId,
  {
   status:"released",
   releaseDate:new Date()
  },
  {new:true}
 )

 res.json({
  success:true,
  message:"Payment released",
  escrow
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }
}

export const getAllUsersWithProfile = async (req, res) => {
  try {

    const profiles = await Profile.find()
      .populate("user", "email role isActive");

    const data = profiles.map(p => ({
      _id: p.user?._id,
      email: p.user?.email,
      role: p.user?.role,
      isActive: p.user?.isActive,

      name: p.name,
      bio: p.bio,
      location: p.location,
      followers: p.followers,
      categories: p.categories,
      platform: p.platform,
      companyName: p.companyName,
      profileImage: p.profileImage
    }));

    res.json({
      success: true,
      users: data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
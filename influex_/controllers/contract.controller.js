import  Contract  from "../models/contract.js"
import User from "../models/user.js"
import ContactUnlock from "../models/contactUnlock.js"

export const createContract = async (req,res)=>{

 const {dealId,deliverables,timeline,amount,influencerId} = req.body

 const contract = await Contract.create({

  dealId,
  brandId:req.user._id, 
  influencerId,
  deliverables,
  timeline,
  amount

 })

 res.json(contract)

}
export const signContract = async (req,res)=>{

 const {contractId} = req.body

 const contract = await Contract.findById(contractId)

 contract.status = "signed"

 await contract.save()

 res.json({message:"Contract signed"})

}


export const unlockContact = async (req,res)=>{

 try{

 const {influencerId} = req.body

 const brand = await User.findById(req.user.id)

 if(brand.bits < 50){
  return res.status(400).json({message:"Not enough bits"})
 }

 // deduct bits
 brand.bits -= 50
 await brand.save()

 // save unlock record
 await ContactUnlock.create({
   brandId: brand._id,
   influencerId
 })

 const creator = await User.findById(influencerId)

 res.json({
   email: creator.email
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }

}
export const getMyContracts = async (req,res)=>{
 try{

 const contracts = await Contract.find({
  brandId:req.user._id
 }).populate("influencerId","username email")

 res.json(contracts)

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
export const getContract = async (req,res)=>{
 try{

 const {id} = req.params

 const contract = await Contract.findById(id)
  .populate("brandId","username email")
  .populate("influencerId","username email")

 if(!contract){
  return res.status(404).json({message:"Contract not found"})
 }

 res.json(contract)

 }catch(err){
  res.status(500).json({message:err.message})
 }
}
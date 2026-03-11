import Contract from "../models/contract.js"
import User from "../models/user.js"
import ContactUnlock from "../models/contactUnlock.js"

export const createContract = async (req,res)=>{

 const {dealId,deliverables,timeline,amount,creatorId} = req.body

 const contract = await Contract.create({

  dealId,
  brandId:req.user.id,
  creatorId,
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

 const {creatorId} = req.body

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
   creatorId
 })

 const creator = await User.findById(creatorId)

 res.json({
   email: creator.email
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }

}
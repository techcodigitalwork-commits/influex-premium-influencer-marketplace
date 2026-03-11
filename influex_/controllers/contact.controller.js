import User from "../models/user.js"

export const unlockContact = async (req,res)=>{

 try{

 if(!req.user){
   return res.status(401).json({message:"User not authenticated"})
 }

 const {influencerId} = req.body

 const brand = await User.findById(req.user._id)

 if(!brand){
   return res.status(404).json({message:"Brand not found"})
 }

 if(brand.bits < 50){
  return res.status(400).json({message:"Not enough bits"})
 }

 brand.bits -= 50
 await brand.save()

 const creator = await User.findById(influencerId)

 if(!creator){
   return res.status(404).json({message:"Creator not found"})
 }

 res.json({
   email:creator.email
 })

 }catch(err){
  res.status(500).json({message:err.message})
 }

}
import User from "../models/user.js"

export const unlockContact = async (req,res)=>{

 const {influencerId} = req.body

 const brand = await User.findById(req.user._id)

 if(brand.bits < 50){
  return res.status(400).json({message:"Not enough bits"})
 }

 brand.bits -= 50
 await brand.save()

 const creator = await User.findById(influencerId)

 res.json({
   email:creator.email
 })

}
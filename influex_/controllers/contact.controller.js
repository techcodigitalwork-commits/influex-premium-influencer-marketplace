import User from "../models/user.js"

export const unlockContact = async (req,res)=>{

 const {creatorId} = req.body

 const brand = await User.findById(req.user.id)

 if(brand.bits < 50){
  return res.status(400).json({message:"Not enough bits"})
 }

 brand.bits -= 50
 await brand.save()

 const creator = await User.findById(creatorId)

 res.json({
   email:creator.email
 })

}
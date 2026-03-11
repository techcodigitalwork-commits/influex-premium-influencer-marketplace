import User from "../models/user.js"

export const rewardCreator = async (creatorId)=>{

 const creator = await User.findById(creatorId)

 creator.bits += 20

 await creator.save()

}
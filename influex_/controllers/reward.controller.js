import User from "../models/user.js"

export const rewardCreator = async (influencerId)=>{

 const creator = await User.findById(influencerId)

 creator.bits += 20

 await creator.save()

}
import Invite from "../models/invite.js"

export const sendInvite = async (req,res)=>{

 const {campaignId,influencerId} = req.body

 const invite = await Invite.create({

  campaignId,
  influencerId,
  brandId:req.user._id

 })

 res.json(invite)

}
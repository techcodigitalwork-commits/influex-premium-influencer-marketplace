import Invite from "../models/invite.js"

export const sendInvite = async (req,res)=>{

 const {campaignId,creatorId} = req.body

 const invite = await Invite.create({

  campaignId,
  creatorId,
  brandId:req.user.id

 })

 res.json(invite)

}
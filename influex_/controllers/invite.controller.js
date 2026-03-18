import Invite from "../models/invite.js";
import Notification from "../models/notification.js";
import Conversation from "../models/Conversation.js";

export const sendInvite = async (req, res) => {
  const { campaignId, influencerId } = req.body;

  // 1️⃣ Create Invite
  const invite = await Invite.create({
    campaignId,
    influencerId,
    brandId: req.user._id,
    status: "pending",
  });

  // 2️⃣ Notify Influencer
  const notification = await Notification.create({
    userId: influencerId,
    type: "invite",
    message: `You have been invited to campaign ${campaignId}`,
    data: {
      campaignId,
      brandId: req.user._id,
      inviteId: invite._id
    },
    read: false
  });

  res.json({ invite, notification });
};

export const respondInvite = async (req, res) => {
  const { inviteId, action } = req.body; // action = "accepted" or "rejected"

  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  // 1️⃣ Update Invite Status
  const invite = await Invite.findByIdAndUpdate(
    inviteId,
    { status: action },
    { new: true }
  );

  if (!invite) return res.status(404).json({ message: "Invite not found" });

  let conversation = null;

  // 2️⃣ Agar accepted hai to chat start karne ke liye conversation create karo
  if (action === "accepted") {
    conversation = await Conversation.create({
      participants: [invite.brandId, invite.influencerId],
      campaignId: invite.campaignId,
      messages: [] // empty initially
    });
  }

  // 3️⃣ Notify Brand
  const notification = await Notification.create({
    userId: invite.brandId,
    type: "invite_response",
    message: `Influencer has ${action} your invite for campaign ${invite.campaignId}`,
    data: { 
      inviteId, 
      influencerId: invite.influencerId,
      conversationId: conversation?._id // chat link available if accepted
    }
  });

  res.json({ invite, notification, conversation });
};
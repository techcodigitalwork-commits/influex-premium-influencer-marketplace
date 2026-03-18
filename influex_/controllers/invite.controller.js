import Invite from "../models/invite.js";
import Notification from "../models/notification.js";
import Conversation from "../models/Conversation.js";

// ==============================
// SEND INVITE
// ==============================
export const sendInvite = async (req, res) => {
  try {
    const { campaignId, influencerId } = req.body;

    // 🔥 Prevent duplicate invite
    const existingInvite = await Invite.findOne({
      campaignId,
      influencerId,
      brandId: req.user._id
    });

    if (existingInvite) {
      return res.status(400).json({
        message: "Invite already sent"
      });
    }

    // 1️⃣ Create Invite
    const invite = await Invite.create({
      campaignId,
      influencerId,
      brandId: req.user._id,
      status: "pending",
    });

    // 2️⃣ Notify Influencer
    const notification = await Notification.create({
      user: influencerId,
      sender: req.user._id,
      type: "invite",
      message: "You have been invited to a campaign",
      data: {
        campaignId,
        inviteId: invite._id
      },
      link: `/campaign/${campaignId}`,
      read: false
    });

    res.json({ invite, notification });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==============================
// RESPOND INVITE
// ==============================
export const respondInvite = async (req, res) => {
  try {
    const { inviteId, action } = req.body;

    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // 1️⃣ Find Invite first (for security check)
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    // 🔥 Only influencer can respond
    if (String(invite.influencerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 2️⃣ Update Invite
    if (action === "accepted") {
  invite.status = "connected";  // 🔥 CHANGE HERE
} else {
  invite.status = "rejected";
}
    invite.respondedAt = new Date();
    await invite.save();

    let conversation = null;

    // 3️⃣ Create / find chat if accepted
    if (action === "accepted") {
      conversation = await Conversation.findOne({
        participants: { $all: [invite.brandId, invite.influencerId] },
        campaignId: invite.campaignId
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [invite.brandId, invite.influencerId],
          campaignId: invite.campaignId,
          messages: []
        });
      }
    }

    // 4️⃣ Notify Brand
    const notification = await Notification.create({
      user: invite.brandId,
      sender: invite.influencerId,
      type: "invite_response",
      message: `Influencer has ${action} your invite`,
      data: {
        inviteId,
        influencerId: invite.influencerId,
        conversationId: conversation?._id
      },
      link: action === "accepted" && conversation
        ? `/chat/${conversation._id}`   // ✅ safe
        : `/campaign/${invite.campaignId}`
    });

    res.json({ invite, notification, conversation });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js"; // optional

export const decideApplication = async (req, res) => {
  try {
    const { decision } = req.body; // accepted / rejected

    if (!["accepted", "rejected"].includes(decision.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    // Only campaign owner (brand) can decide
    if (String(campaign.brandId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update application status
    application.status = decision.toLowerCase();
    await application.save();

    // If accepted → start campaign + create chat + notification
    if (decision.toLowerCase() === "accepted") {
      campaign.status = "ongoing";
      await campaign.save();

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        campaignId: campaign._id,
        participants: { $all: [campaign.brandId, application.influencer] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          campaignId: campaign._id,
          participants: [campaign.brandId, application.influencer],
          messages: [],
          lastMessage: "Application accepted! Start your chat.",
          lastMessageAt: new Date()
        });
      }

      // Optional: Notification
      await Notification.create({
        user: application.influencer,
        message: `Your application for "${campaign.title}" has been accepted! You can now chat with the brand.`,
        type: "application_accepted",
        read: false
      });
    }

    return res.json({
      success: true,
      message: `Application ${decision.toLowerCase()}`
    });

  } catch (error) {
    console.error("Decide Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application"
    });
  }
};

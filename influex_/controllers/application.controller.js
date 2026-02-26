import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import { createNotificationService } from "../services/notification.service.js";
import mongoose from "mongoose";

// ======================================================
// SUBSCRIPTION EXPIRY CHECK
// ======================================================
export const checkSubscriptionExpiry = async (user) => {
  if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
    user.isSubscribed = false;
    await user.save();
  }
};

// ======================================================
// DECIDE APPLICATION (Brand Accept / Reject)
// ======================================================
export const decideApplication = async (req, res) => {
  try {
    const { decision } = req.body;

    if (!["accepted", "rejected"].includes(decision.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    const campaign = await Campaign.findById(application.campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    if (String(campaign.brandId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    application.status = decision.toLowerCase();
    await application.save();

    if (decision.toLowerCase() === "accepted") {
      await Application.updateMany(
        { campaignId: campaign._id, status: "pending", _id: { $ne: application._id } },
        { status: "rejected" }
      );

      campaign.status = "ongoing";
      await campaign.save();

      let conversation = await Conversation.findOne({
        campaignId: campaign._id,
        participants: { $all: [campaign.brandId, application.influencerId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          campaignId: campaign._id,
          participants: [campaign.brandId, application.influencerId],
          messages: [],
          lastMessage: "Application accepted! Start your chat.",
          lastMessageAt: new Date()
        });
      }

    await createNotificationService({
  userId: application.influencerId,
  senderId: campaign.brandId,   // 🔥 brand is sender
  message: `Your application for "${campaign.title}" has been accepted!`,
  type: "application_accepted",
  link: `/campaign/${campaign._id}`,
  applicationId: application._id
});
    }

    return res.json({ success: true, message: `Application ${decision.toLowerCase()}` });

  } catch (error) {
    console.error("Decide Application Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update application" });
  }
};

// ======================================================
// APPLY TO CAMPAIGN (Influencer) with bits deduction & expiry check
// ======================================================
export const applyToCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const influencerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, message: "Invalid Campaign ID" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    if (String(campaign.brandId) === String(influencerId)) {
      return res.status(400).json({ success: false, message: "You cannot apply to your own campaign" });
    }

    if (campaign.status !== "open") {
      return res.status(400).json({ success: false, message: "Campaign is not open for applications" });
    }

    const user = await User.findById(influencerId);
    await checkSubscriptionExpiry(user); // 🔥 check expiry

    if (!["influencer", "model", "photographer", "food", "travel"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Only influencers/models/photographers can apply" });
    }

    if (!user.isSubscribed && user.bits < 10) {
      return res.status(403).json({ success: false, message: "Insufficient bits. Please subscribe." });
    }

    const alreadyApplied = await Application.findOne({ campaignId, influencerId });
    if (alreadyApplied) return res.status(400).json({ success: false, message: "Already applied to this campaign" });

    const application = await Application.create({ campaignId, influencerId, status: "pending" });

    if (!user.isSubscribed) user.bits -= 10;
    user.applicationsUsed += 1;
    await user.save();

   await createNotificationService({
  userId: campaign.brandId,          // notification kis ko milegi
  senderId: influencerId,            // kisne bheja (🔥 important)
  message: `New application received for "${campaign.title}"`,
  type: "new_application",
  link: `/campaign/${campaign._id}`,
  applicationId: application._id
});

    return res.status(201).json({ success: true, message: "Application submitted successfully", application });

  } catch (error) {
    console.error("Apply To Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to apply to campaign" });
  }
};

// ======================================================
// PURCHASE SUBSCRIPTION (Razorpay / Manual)
// ======================================================
export const purchaseSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.isSubscribed = true;
    user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    res.json({ success: true, message: "Subscription activated" });
  } catch (err) {
    console.error("Purchase Subscription Error:", err);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};

// ======================================================
// GET APPLICATIONS / MY APPLICATIONS (UNCHANGED)
// ======================================================
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ campaignId: req.params.id }).populate("influencerId", "name email");
    return res.json({ success: true, applications });
  } catch (error) {
    console.error("Get Applications Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ influencerId: req.user._id }).populate("campaignId");
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
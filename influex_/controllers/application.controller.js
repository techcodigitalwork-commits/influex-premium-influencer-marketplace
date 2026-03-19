import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import { createNotificationService } from "../services/notification.service.js";
import mongoose from "mongoose";

// ======================================================
// PLAN LIMITS
// ======================================================
// ======================================================
// TOKEN CONFIG
// ======================================================
const TOKENS = {
  free: 100,
  pro_monthly: 1000,
  pro_plus_monthly: 2000,
  pro_yearly: 15000,
  pro_plus_yearly: 25000
};

const COST = {
  APPLY: 10
};

// ======================================================
// SUBSCRIPTION EXPIRY CHECK
// ======================================================
export const checkSubscriptionExpiry = async (user) => {
  if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
    user.isSubscribed = false;
    user.plan = "free";
    await user.save();
  }
};

// ======================================================
// DECIDE APPLICATION (Brand Accept / Reject)
// ======================================================
export const decideApplication = async (req, res) => {
  try {
    const { decision } = req.body;
    const decisionLower = decision.toLowerCase();

    if (!["accepted", "rejected"].includes(decisionLower)) {
      return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const campaign = await Campaign.findById(application.campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (String(campaign.brandId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ prevent multiple accept
    if (decisionLower === "accepted") {
      const alreadyAccepted = await Application.findOne({
        campaignId: campaign._id,
        status: "accepted"
      });

      if (alreadyAccepted) {
        return res.status(400).json({
          success: false,
          message: "An influencer is already accepted for this campaign"
        });
      }
    }

    // ✅ update status
    application.status = decisionLower;
    await application.save();

    // =====================================================
    // ✅ ACCEPT
    // =====================================================
    if (decisionLower === "accepted") {

      campaign.status = "in_progress"; // 🔥 lock campaign
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
        senderId: campaign.brandId,
        message: `Your application for "${campaign.title}" has been accepted!`,
        type: "application_accepted",
        link: `/campaign/${campaign._id}`,
        applicationId: application._id
      });

    }

    // =====================================================
    // ❌ REJECT
    // =====================================================
    else if (decisionLower === "rejected") {

      console.log("🔥 REJECT BLOCK TRIGGERED");

      await createNotificationService({
        userId: application.influencerId,
        senderId: campaign.brandId,
        message: `Your application for "${campaign.title}" was rejected`,
        type: "application_rejected",
        link: `/campaign/${campaign._id}`,
        applicationId: application._id
      });

    }

    return res.json({
      success: true,
      message: `Application ${decisionLower}`
    });

  } catch (error) {
    console.error("Decide Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application"
    });
  }
};
import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import { createNotificationService } from "../services/notification.service.js";
import mongoose from "mongoose";

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
// DECIDE APPLICATION (ACCEPT / REJECT)
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

    // 🔥 prevent multiple accept
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

    application.status = decisionLower;
    await application.save();

    // ===========================
    // ACCEPT
    // ===========================
    if (decisionLower === "accepted") {

      campaign.status = "in_progress";
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

    // ===========================
    // REJECT
    // ===========================
    else if (decisionLower === "rejected") {

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

// ======================================================
// APPLY TO CAMPAIGN
// ======================================================
export const applyToCampaign = async (req, res) => {
  try {

    const campaignId = req.params.id;
    const influencerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success:false,
        message:"Invalid Campaign ID"
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success:false,
        message:"Campaign not found"
      });
    }

    if (String(campaign.brandId) === String(influencerId)) {
      return res.status(400).json({
        success:false,
        message:"You cannot apply to your own campaign"
      });
    }

    if (campaign.status !== "open") {
      return res.status(400).json({
        success:false,
        message:"Campaign is not open for applications"
      });
    }

    const user = await User.findById(influencerId);
    if (!user) {
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    if (user.bits === undefined || user.bits === null) {
      user.bits = TOKENS[user.plan] || 100;
    }

    if (user.bits < COST.APPLY) {
      return res.status(403).json({
        success:false,
        message:"Not enough tokens. Upgrade your plan.",
        bits:user.bits
      });
    }

    const alreadyApplied = await Application.findOne({
      campaignId,
      influencerId
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success:false,
        message:"Already applied to this campaign"
      });
    }

    const application = await Application.create({
      campaignId,
      influencerId,
      bidAmount: req.body.bidAmount || 0,
      proposal: req.body.proposal || "",
      status:"pending"
    });

    user.bits -= COST.APPLY;
    user.applicationsUsed = (user.applicationsUsed || 0) + 1;
    await user.save();

    await createNotificationService({
      userId: campaign.brandId,
      senderId: influencerId,
      message: `New application received for "${campaign.title}"`,
      type: "new_application",
      link: `/campaign/${campaign._id}`,
      applicationId: application._id
    });

    return res.status(201).json({
      success:true,
      message:"Application submitted successfully",
      application,
      remainingTokens: user.bits
    });

  } catch (error) {
    console.error("Apply To Campaign Error:", error);
    return res.status(500).json({
      success:false,
      message:"Failed to apply to campaign"
    });
  }
};
// ======================================================
// GET APPLICATIONS (for brand)
// ======================================================
export const getApplications = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID"
      });
    }

    const applications = await Application.find({
      campaignId: id
    })
    .sort({ createdAt: -1 })
    .populate("influencerId", "name email");

    return res.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error("Get Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
};

// ======================================================
// GET MY APPLICATIONS (for influencer)
// ======================================================
export const getMyApplications = async (req, res) => {
  try {

    const applications = await Application.find({
      influencerId: req.user._id
    })
    .sort({ createdAt: -1 })
    .populate("campaignId");

    res.status(200).json({
      success: true,
      applications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
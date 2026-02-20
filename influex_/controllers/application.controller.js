import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";
//import Notification from "../models/notification.js";
import { createNotificationService } from "../services/notification.service.js";
import mongoose from "mongoose";

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
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (String(campaign.brandId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    application.status = decision.toLowerCase();
    await application.save();

    // If accepted
    if (decision.toLowerCase() === "accepted") {

      // Reject other pending applications
      await Application.updateMany(
        {
          campaign: campaign._id,
          status: "pending",
          _id: { $ne: application._id }
        },
        { status: "rejected" }
      );

      campaign.status = "ongoing";
      await campaign.save();

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

      await createNotificationService({
      userId: application.influencer,
       message: `Your application for "${campaign.title}" has been accepted! You can now chat with the brand.`,
       type: "application_accepted",
       link: `/campaign/${campaign._id}`
    });
    }

    return res.json({
      success: true,
      message: `Application ${decision.toLowerCase()}`
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
// GET APPLICATIONS FOR A CAMPAIGN
// ======================================================
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      campaign: req.params.id
    }).populate("influencer", "name email");

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
// APPLY TO CAMPAIGN (Influencer)
// ======================================================
export const applyToCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const influencerId = req.user._id;

     if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Campaign ID"
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    if (String(campaign.brandId) === String(influencerId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own campaign"
      });
    }

    if (campaign.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Campaign is not open for applications"
      });
    }

    const alreadyApplied = await Application.findOne({
      campaign: campaignId,
      influencer: influencerId
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this campaign"
      });
    }

    const application = await Application.create({
      campaign: campaignId,
      influencer: influencerId,
      status: "pending"
    });

  await createNotificationService({
     userId: campaign.brandId,
     message: `New application received for "${campaign.title}"`,
     type: "new_application",
     link: `/campaign/${campaign._id}`
   });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error("Apply To Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply to campaign"
    });
  }
};
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      influencer: req.user._id
    }).populate("campaign");

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
import Application from "../models/application.js";
import Campaign from "../models/Campaign.js";
import Conversation from "../models/Conversation.js";

export const decideApplication = async (req, res) => {
  try {
    const { decision } = req.body; // ACCEPTED or REJECTED

    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision"
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    const campaign = await Campaign.findById(application.campaignId);

    // Only campaign owner (brand) can decide
    if (String(campaign.brandId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Update application status
    application.status = decision;
    await application.save();

    // If accepted → start campaign + open chat
    if (decision === "ACCEPTED") {
      campaign.status = "ONGOING";
      await campaign.save();

      await Conversation.create({
        campaignId: campaign._id,
        participants: [campaign.brandId, application.creatorId]
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





export const applyCampaign = async (req, res) => {
  const exists = await Application.findOne({
    campaignId: req.params.id,
    creatorId: req.user._id
  });

  if (exists)
    return res.status(400).json({ message: "Already applied" });

  const app = await Application.create({
    campaignId: req.params.id,
    creatorId: req.user._id,
    message: req.body.message
  });

  res.json({ success: true, data: app });
};

export const getApplications = async (req, res) => {
  const apps = await Application.find({
    campaignId: req.params.id
  }).populate("creatorId", "profile rating");

  res.json({ data: apps });
};

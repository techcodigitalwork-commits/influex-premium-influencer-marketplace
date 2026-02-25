import Campaign from "../models/Campaign.js";
import Profile from "../models/profile.js";

export const createCampaign = async (req, res) => {
  try {
    if (req.user.role !== "brand") {
      return res.status(403).json({
        success: false,
        message: "Only brands can create campaigns"
      });
    }

    const {
      title,
      description,
      roles,
      categories,
      city,
      budget
    
    } = req.body;

    const campaign = await Campaign.create({
      brandId: req.user._id,
      title,
      description,
      roles,
      categories,
      city,
      budget
    });

    res.status(201).json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error("Create Campaign Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create campaign"
    });
  }
};



export const matchingCampaigns = async (req, res) => {
  try {
    const user = req.user;

    // 🔥 Get profile separately
    const profile = await Profile.findOne({ user: user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const campaigns = await Campaign.find({
      status: "open",
      city: profile.location   // ✅ using profile.location
    });

    res.json({ success: true, data: campaigns });

  } catch (error) {
    console.error("Matching Campaign Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch matching campaigns"
    });
  }
};
export const completeCampaign = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, {
    status: "completed"
  });

  res.json({ success: true });
};
import Campaign from "../models/Campaign.js";
import Application from "../models/application.js";

export const getMyCampaigns = async (req, res) => {
  try {

    // ✅ BRAND → Apne campaigns
    if (req.user.role === "brand") {
      const campaigns = await Campaign.find({ brandId: req.user._id });

      return res.json({
        success: true,
        data: campaigns
      });
    }

    // ✅ INFLUENCER → All open campaigns + applied status
    if (req.user.role === "influencer") {

      // 1️⃣ Get all open campaigns
      const campaigns = await Campaign.find({ status: "open" });

      // 2️⃣ Get influencer applications
      const applications = await Application.find({
        creatorId: req.user._id
      });

      const appliedCampaignIds = applications.map(app =>
        app.campaignId.toString()
      );

      // 3️⃣ Add applied flag
      const updatedCampaigns = campaigns.map(campaign => ({
        ...campaign._doc,
        applied: appliedCampaignIds.includes(campaign._id.toString())
      }));

      return res.json({
        success: true,
        data: updatedCampaigns
      });
    }

  } catch (error) {
    console.error("Get Campaigns Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns"
    });
  }
};
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign"
    });
  }
};
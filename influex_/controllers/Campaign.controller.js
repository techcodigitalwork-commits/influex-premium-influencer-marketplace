import Campaign from "../models/Campaign.js";
import Profile from "../models/profile.js";
import Application from "../models/application.js";
import User from "../models/user.js";
import { checkSubscriptionExpiry } from "./application.controller.js"; // 🔥 reuse

// ======================================================
// CREATE CAMPAIGN (Brand) with free limit + expiry check
// ======================================================
export const createCampaign = async (req, res) => {
  try {
    if (req.user.role !== "brand") {
      return res.status(403).json({ success: false, message: "Only brands can create campaigns" });
    }

    const brand = await User.findById(req.user._id);
    await checkSubscriptionExpiry(brand); // 🔥 check expiry

    if (!brand.isSubscribed && brand.campaignsCreated >= 5) {
      return res.status(403).json({ success: false, message: "Free campaign limit reached. Please subscribe to create more." });
    }

    const { title, description, roles, categories, city, budget } = req.body;

    const campaign = await Campaign.create({ brandId: req.user._id, title, description, roles, categories, city, budget });

    brand.campaignsCreated += 1;
    await brand.save();

    res.status(201).json({ success: true, data: campaign });

  } catch (error) {
    console.error("Create Campaign Error:", error);
    res.status(500).json({ success: false, message: "Failed to create campaign" });
  }
};

// ======================================================
// MATCHING CAMPAIGNS / COMPLETE CAMPAIGN / GET MY CAMPAIGNS / GET BY ID
// ======================================================
export const matchingCampaigns = async (req, res) => {
  try {
    const user = req.user;
    const profile = await Profile.findOne({ user: user._id });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const campaigns = await Campaign.find({ status: "open", city: profile.location });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error("Matching Campaign Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch matching campaigns" });
  }
};

export const completeCampaign = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, { status: "completed" });
  res.json({ success: true });
};

export const getMyCampaigns = async (req, res) => {
  try {
    if (req.user.role === "brand") {
      const campaigns = await Campaign.find({ brandId: req.user._id });
      return res.json({ success: true, data: campaigns });
    }

    if (req.user.role === "influencer") {
      const campaigns = await Campaign.find({ status: "open" });
      const applications = await Application.find({ creatorId: req.user._id });
      const appliedCampaignIds = applications.map(app => app.campaignId.toString());

      const updatedCampaigns = campaigns.map(campaign => ({
        ...campaign._doc,
        applied: appliedCampaignIds.includes(campaign._id.toString())
      }));

      return res.json({ success: true, data: updatedCampaigns });
    }

  } catch (error) {
    console.error("Get Campaigns Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error("Get Campaign By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch campaign" });
  }
};
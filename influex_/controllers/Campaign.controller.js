import Campaign from "../models/Campaign.js";
import Profile from "../models/profile.js";
import Application from "../models/application.js";
import User from "../models/user.js";
import { checkSubscriptionExpiry } from "./application.controller.js";

// ======================================================
// PLAN LIMITS
// ======================================================
const PLAN_LIMITS = {
  free: {
    campaigns: 10
  },
  pro: {
    campaigns: 30
  },
  pro_plus: {
    campaigns: Infinity
  }
};

// ======================================================
// CREATE CAMPAIGN
// ======================================================
const COINS_PER_CAMPAIGN = 20;

export const createCampaign = async (req, res) => {
  try {

    // role check
    if (req.user.role !== "brand") {
      return res.status(403).json({
        success: false,
        message: "Only brands can create campaigns"
      });
    }

    // get brand
    const brand = await User.findById(req.user._id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    await checkSubscriptionExpiry(brand);

    // default values
    if (brand.bits === undefined || brand.bits === null) {
      brand.bits = 100;
    }

    if (brand.campaignsCreated === undefined || brand.campaignsCreated === null) {
      brand.campaignsCreated = 0;
    }

    // PLAN LIMIT CHECK
    const limits = PLAN_LIMITS[brand.plan || "free"];

    if (!brand.isSubscribed && brand.campaignsCreated >= limits.campaigns) {
      return res.status(403).json({
        success: false,
        message: "Campaign limit reached. Upgrade your plan."
      });
    }

    // coins check (only for free plan)
    if (!brand.isSubscribed && brand.plan === "free" && brand.bits < COINS_PER_CAMPAIGN) {
      return res.status(403).json({
        success: false,
        message: "Coins khatam! Upgrade to Pro.",
        bits: brand.bits
      });
    }

    const { title, description, roles, categories, city, budget } = req.body;

    const campaign = await Campaign.create({
      brandId: req.user._id,
      title,
      description,
      roles,
      categories,
      city,
      budget
    });

    // deduct coins (only free plan)
    if (!brand.isSubscribed && brand.plan === "free") {
      brand.bits -= COINS_PER_CAMPAIGN;
    }

    brand.campaignsCreated += 1;

    await brand.save();

    res.status(201).json({
      success: true,
      data: campaign,
      bits: brand.bits
    });

  } catch (error) {
    console.error("Create Campaign Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create campaign"
    });
  }
};


// ======================================================
// MATCHING CAMPAIGNS
// ======================================================
export const matchingCampaigns = async (req, res) => {
  try {

    const user = req.user;

    const profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const campaigns = await Campaign.find({
      status: "open",
      city: profile.location
    });

    res.json({
      success: true,
      data: campaigns
    });

  } catch (error) {
    console.error("Matching Campaign Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch matching campaigns"
    });
  }
};

// ======================================================
// COMPLETE CAMPAIGN
// ======================================================
export const completeCampaign = async (req, res) => {
  try {

    await Campaign.findByIdAndUpdate(req.params.id, {
      status: "completed"
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete campaign"
    });
  }
};

// ======================================================
// GET MY CAMPAIGNS
// ======================================================
export const getMyCampaigns = async (req, res) => {
  try {

    if (req.user.role === "brand") {

      const campaigns = await Campaign.find({
        brandId: req.user._id
      });

      const brand = await User.findById(req.user._id);

      return res.json({
        success: true,
        data: campaigns,
        bits: brand.bits,
        isSubscribed: brand.isSubscribed
      });
    }

    if (req.user.role === "influencer") {

      const campaigns = await Campaign.find({
        status: "open"
      });

      const applications = await Application.find({
        influencerId: req.user._id
      });

      const appliedCampaignIds = applications.map(app =>
        app.campaignId.toString()
      );

      const updatedCampaigns = campaigns.map(campaign => ({
        ...campaign._doc,
        applied: appliedCampaignIds.includes(
          campaign._id.toString()
        )
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

// ======================================================
// GET CAMPAIGN BY ID
// ======================================================
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
    console.error("Get Campaign By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign"
    });
  }
};
import Campaign from "../models/Campaign.js";
import Profile from "../models/profile.js";
import Application from "../models/application.js";
import User from "../models/user.js";
import { checkSubscriptionExpiry } from "./application.controller.js";

const COINS_PER_CAMPAIGN = 20;

// ======================================================
// CREATE CAMPAIGN
// ======================================================
export const createCampaign = async (req, res) => {
  try {
if (!brand.isSubscribed && brand.bits < COINS_PER_CAMPAIGN) 
    if (req.user.role !== "brand") {
      return res.status(403).json({
        success: false,
        message: "Only brands can create campaigns"
      });
    }

    const brand = await User.findById(req.user._id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    await checkSubscriptionExpiry(brand);

    // Free plan coin check
    if (!brand.isSubscribed && brand.bits < COINS_PER_CAMPAIGN) {
      return res.status(403).json({
        success: false,
        message: "Coins khatam! Upgrade to Pro to create more campaigns.",
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

    // deduct coins only for free users
    if (!brand.isSubscribed) {
  const currentBits = brand.bits ?? 100;
  brand.bits = Math.max(0, currentBits - COINS_PER_CAMPAIGN);
}

    brand.campaignsCreated = (brand.campaignsCreated || 0) + 1;

    await brand.save();

    return res.status(201).json({
      success: true,
      data: campaign,
      bits: brand.bits
    });

  } catch (error) {
    console.error("Create Campaign Error:", error);
    return res.status(500).json({
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

    const profile = await Profile.findOne({ user: req.user._id });

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

    return res.json({
      success: true,
      data: campaigns
    });

  } catch (error) {
    console.error("Matching Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns"
    });
  }
};


// ======================================================
// COMPLETE CAMPAIGN
// ======================================================
export const completeCampaign = async (req, res) => {
  try {

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    return res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error("Complete Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update campaign"
    });
  }
};


// ======================================================
// GET MY CAMPAIGNS
// ======================================================
export const getMyCampaigns = async (req, res) => {
  try {

    // BRAND
    if (req.user.role === "brand") {
      const campaigns = await Campaign.find({ brandId: req.user._id });

      return res.json({
        success: true,
        data: campaigns
      });
    }

    // INFLUENCER
    if (req.user.role === "influencer") {

      const campaigns = await Campaign.find({ status: "open" });

      const applications = await Application.find({
        creatorId: req.user._id
      });

      const appliedCampaignIds = applications.map(app =>
        app.campaignId.toString()
      );

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

    return res.status(500).json({
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

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    return res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error("Get Campaign By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign"
    });
  }
};



//import Campaign from "../models/Campaign.js";
// import Profile from "../models/profile.js";
// import Application from "../models/application.js";
// import User from "../models/user.js";
// import { checkSubscriptionExpiry } from "./application.controller.js"; // 🔥 reuse

// // ======================================================
// // CREATE CAMPAIGN (Brand) with free limit + expiry check
// // ======================================================
//  const COINS_PER_CAMPAIGN = 20; // brand ke liye

// // ======================================================
// // CREATE CAMPAIGN — bits deduct karo
// // ======================================================
// export const createCampaign = async (req, res) => {
//   try {
//     if (req.user.role !== "brand") {
//       return res.status(403).json({ success: false, message: "Only brands can create campaigns" });
//     }

//     const brand = await User.findById(req.user._id);
//     await checkSubscriptionExpiry(brand);

//     // Free limit check
//     if (!brand.isSubscribed && brand.bits < COINS_PER_CAMPAIGN) {
//       return res.status(403).json({
//         success: false,
//         message: "Coins khatam! Upgrade to Pro to create more campaigns.",
//         bits: brand.bits
//       });
//     }

//     const { title, description, roles, categories, city, budget } = req.body;
//     const campaign = await Campaign.create({
//       brandId: req.user._id,
//       title, description, roles, categories, city, budget
//     });

//     // ✅ Bits deduct karo (subscribed users ke liye nahi)
//     if (!brand.isSubscribed) {
//       brand.bits = Math.max(0, (brand.bits || 100) - COINS_PER_CAMPAIGN);
//     }
//     brand.campaignsCreated += 1;
//     await brand.save();

//     res.status(201).json({
//       success: true,
//       data: campaign,
//       bits: brand.bits  // ✅ Frontend ko updated bits bhejo
//     });
//   } catch (error) {
//     console.error("Create Campaign Error:", error);
//     res.status(500).json({ success: false, message: "Failed to create campaign" });
//   }
// };
// // ======================================================
// // MATCHING CAMPAIGNS / COMPLETE CAMPAIGN / GET MY CAMPAIGNS / GET BY ID
// // ======================================================
// export const matchingCampaigns = async (req, res) => {
//   try {
//     const user = req.user;
//     const profile = await Profile.findOne({ user: user._id });
//     if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

//     const campaigns = await Campaign.find({ status: "open", city: profile.location });
//     res.json({ success: true, data: campaigns });
//   } catch (error) {
//     console.error("Matching Campaign Error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch matching campaigns" });
//   }
// };

// export const completeCampaign = async (req, res) => {
//   await Campaign.findByIdAndUpdate(req.params.id, { status: "completed" });
//   res.json({ success: true });
// };

// export const getMyCampaigns = async (req, res) => {
//   try {
//     if (req.user.role === "brand") {
//       const campaigns = await Campaign.find({ brandId: req.user._id });
//       return res.json({ success: true, data: campaigns });
//     }

//     if (req.user.role === "influencer") {
//       const campaigns = await Campaign.find({ status: "open" });
//       const applications = await Application.find({ creatorId: req.user._id });
//       const appliedCampaignIds = applications.map(app => app.campaignId.toString());

//       const updatedCampaigns = campaigns.map(campaign => ({
//         ...campaign._doc,
//         applied: appliedCampaignIds.includes(campaign._id.toString())
//       }));

//       return res.json({ success: true, data: updatedCampaigns });
//     }

//   } catch (error) {
//     console.error("Get Campaigns Error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
//   }
// };

// export const getCampaignById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const campaign = await Campaign.findById(id);
//     if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

//     res.json({ success: true, data: campaign });
//   } catch (error) {
//     console.error("Get Campaign By ID Error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch campaign" });
//   }
// };
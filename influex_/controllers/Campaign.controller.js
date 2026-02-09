// src/controllers/campaign.controller.js


import Campaign from "../models/Campaign.js";

export const createCampaign = async (req, res) => {
  try {
    // Only Brand can create campaign
    if (req.user.role !== "Brand") {
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
      budget,
      deliverables
    } = req.body;

    const campaign = await Campaign.create({
      brandId: req.user._id,
      title,
      description,
      roles,
      categories,
      city,
      budget,
      deliverables,
      status: "OPEN"
    });

    return res.status(201).json({
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
  const user = req.user;

  const campaigns = await Campaign.find({
    status: "OPEN",
    roles: user.role,
    city: user.profile.city,
    budget: { $gte: user.profile.budget }
  });

  res.json({ data: campaigns });
};

export const completeCampaign = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, {
    status: "COMPLETED"
  });

  res.json({ success: true });
};

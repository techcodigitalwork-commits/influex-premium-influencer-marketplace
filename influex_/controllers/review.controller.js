import Review from "../models/review.js";
import Campaign from "../models/Campaign.js";

export const createReview = async (req, res) => {
  try {
    const { campaignId, targetId, rating, comment } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    // Only after completion
    if (campaign.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Campaign not completed yet"
      });
    }

    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne({
      campaignId,
      authorId: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted"
      });
    }

    const review = await Review.create({
      campaignId,
      targetId,
      authorId: req.user._id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error("Create Review Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};

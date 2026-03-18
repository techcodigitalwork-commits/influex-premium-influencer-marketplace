import User from "../models/user.js";
import Profile from "../models/profile.js";

export const unlockContact = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { influencerId } = req.body;

    // Brand check
    const brand = await User.findById(req.user._id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (brand.bits < 50) return res.status(400).json({ message: "Not enough bits" });

    // Deduct 50 bits
    brand.bits -= 50;
    await brand.save();

    // Influencer check
    const influencer = await User.findById(influencerId);
    if (!influencer) return res.status(404).json({ message: "Influencer not found" });

    // Fetch influencer profile for platform / portfolio
    const profile = await Profile.findOne({ userId: influencerId });
    
    res.json({
      email: influencer.email,
      platform: profile?.platform || null, // agar profile nahi hai to null
     // portfolio: profile?.portfolioLink || null
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
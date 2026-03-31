import User from "../models/user.js";
import Profile from "../models/profile.js";

export const unlockContact = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { influencerId } = req.body;
    console.log("REQ ID:", influencerId);

    // Brand check
    const brand = await User.findById(req.user._id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (brand.bits < 50) {
      return res.status(400).json({ message: "Not enough bits" });
    }

    // 🔥 STEP 1: Find profile first
    let profile = await Profile.findById(influencerId);

    // 🔥 STEP 2: If not profileId, try finding via user field
    if (!profile) {
      profile = await Profile.findOne({ user: influencerId });
    }

    if (!profile) {
      return res.status(404).json({ message: "Influencer profile not found" });
    }

    // 🔥 STEP 3: Get actual user
    const influencer = await User.findById(profile.user);

    if (!influencer) {
      return res.status(404).json({ message: "Influencer user not found" });
    }

    // ✅ Deduct bits AFTER validation (important)
    brand.bits -= 50;
    await brand.save();

    res.json({
      email: influencer.email,
      platform: profile?.platform || null,
    });

  } catch (err) {
    console.error("UNLOCK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
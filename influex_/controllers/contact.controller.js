import User from "../models/user.js";
import Profile from "../models/profile.js";
import  contactUnlock from "../models/contactUnlock.js";

export const unlockContact = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { influencerId, type } = req.body;

    if (!type || !["email", "instagram"].includes(type)) {
      return res.status(400).json({ message: "Invalid unlock type" });
    }

    const brandId = req.user._id;

    // 🔍 find profile
    let profile = await Profile.findById(influencerId);
    if (!profile) {
      profile = await Profile.findOne({ user: influencerId });
    }

    if (!profile) {
      return res.status(404).json({ message: "Influencer profile not found" });
    }

    const influencer = await User.findById(profile.user);
    if (!influencer) {
      return res.status(404).json({ message: "Influencer user not found" });
    }

    // 🔒 CHECK: already unlocked?
    const alreadyUnlocked = await  contactUnlock.findOne({
      brandId,
      influencerId: influencer._id,
      type
    });

    if (alreadyUnlocked) {
      // ✅ free return
      if (type === "email") {
        return res.json({ email: influencer.email });
      }
      if (type === "instagram") {
        return res.json({ platform: profile.platform || null });
      }
    }

    // 💰 check balance
    const brand = await User.findById(brandId);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (brand.bits < 50) {
      return res.status(400).json({ message: "Not enough bits" });
    }

    // 💸 deduct
    brand.bits -= 50;
    await brand.save();

    // 💾 save unlock
    await  contactUnlock.create({
      brandId,
      influencerId: influencer._id,
      type
    });

    // 🎯 return based on type
    if (type === "email") {
      return res.json({ email: influencer.email });
    }

    if (type === "instagram") {
      return res.json({ platform: profile.platform || null });
    }

  } catch (err) {
    console.error("UNLOCK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
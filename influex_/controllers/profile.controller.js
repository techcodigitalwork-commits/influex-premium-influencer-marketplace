import Profile from "../models/profile.js";
import User from "../models/user.js";
import ContactUnlock from "../models/contactUnlock.js";
import { fetchSubCategories } from "../services/meta.service.js";


// Create Profile
export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const data = req.body;

    const exists = await Profile.findOne({ user: userId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists"
      });
    }

    const profile = await Profile.create({
      user: userId,
      role: req.user.role,
      ...data
    });
    // Auto update profile status
    await User.findByIdAndUpdate(userId, {
    profileStatus: "completed"
     });

    res.status(201).json({
      success: true,
      profile
    });

  } catch (err) {
    console.error("Create Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Profile creation failed"
    });
  }
};

// Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate("user", "email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.json({
      success: true,
      profile,
      bits: profile.user?.bits,
  isSubscribed: profile.user?.isSubscribed,
  plan: profile.user?.plan,
  subscriptionExpiry: profile.user?.subscriptionExpiry
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
}

// profile search influencers
// // Safe & Brand-Friendly Get Influencers
export const getInfluencers = async (req, res) => {
  try {
    // 1️⃣ Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const brandId = req.user.id;
    let { location, category, minFollowers, maxFollowers, page = 1, limit = 10 } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    // 2️⃣ Build filter
    let filter = { role: "influencer", user: { $ne: null } }; // exclude orphaned users

    if (location) filter.location = location;

    if (category) filter.categories = { $in: [category] };

    if (minFollowers !== undefined || maxFollowers !== undefined) {
      filter.followers = {};
      if (minFollowers !== undefined) filter.followers.$gte = Number(minFollowers);
      if (maxFollowers !== undefined) filter.followers.$lte = Number(maxFollowers);
    }

    // 3️⃣ Fetch influencers from DB
    const influencers = await Profile.find(filter)
      .populate("user", "email name role")
      .skip(skip)
      .limit(limit);

    // 4️⃣ Fetch all unlocked contacts in 1 query to avoid N+1
    const influencerIds = influencers.map(i => i.user?._id).filter(Boolean);
    const unlocks = await ContactUnlock.find({
      brandId,
      creatorId: { $in: influencerIds }
    });

    // 5️⃣ Build response
    const data = influencers.map(inf => {
      const creatorId = inf.user?._id;
      const unlocked = creatorId
        ? unlocks.find(u => u.creatorId.toString() === creatorId.toString())
        : null;

      return {
        id: inf._id,
        name: inf.name,
        bio: inf.bio,
        followers: inf.followers,
        location: inf.location,
        categories: inf.categories,
        subCategories: inf.SubCategories,
        platform: inf.platform,
        profileImage: inf.profileImage,
        companyName: inf.companyName,
        website: inf.website,
        industry: inf.industry,
        email: unlocked ? inf.user.email : null,
        phone: unlocked ? inf.phone : null,
        instagram: unlocked ? inf.instagram : null
      };
    });

    // 6️⃣ Total count for pagination
    const total = await Profile.countDocuments(filter);

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data
    });

  } catch (error) {
    console.error("Get Influencers Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch influencers" });
  }
};

// search brands
export const getBrands = async (req, res) => {
  try {
    const {
      location,
      page = 1,
      limit = 10
    } = req.query;

    let filter = { role: "brand" };

    if (location) filter.location = location;

    const skip = (page - 1) * limit;

    const brands = await Profile.find(filter)
      .populate("user", "email")
      .skip(skip)
      .limit(Number(limit));

    const creatorId = req.user.id;

    const data = await Promise.all(
      brands.map(async (brand) => {

        const unlocked = await ContactUnlock.findOne({
          creatorId,
          brandId: brand.user._id
        });

        return {
          ...brand.toObject(),

          email: unlocked ? brand.user.email : null,
          phone: unlocked ? brand.phone : null
        };

      })
    );

    const total = await Profile.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Allowed fields to update
    const allowedUpdates = [
      "name",
      "bio",
       "followers",
      "location",
      "categories",
      "subCategories",
      "platform",
      "companyName",
      "website",
      "industry",
      "profileImage",
      "phone"
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

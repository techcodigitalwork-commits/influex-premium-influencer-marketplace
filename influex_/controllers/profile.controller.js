import Profile from "../models/profile.js";
import User from "../models/user.js";
import ContactUnlock from "../models/contactUnlock.js";


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
      profile
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
export const getInfluencers = async (req, res) => {
  try {
    const {
      location,
      category,
      minFollowers,
      maxFollowers,
      page = 1,
      limit = 10
    } = req.query;

    let filter = { role: "influencer" };

    if (location) filter.location = location;

    if (category) {
      filter.categories = { $in: [category] };
    }

    if (minFollowers || maxFollowers) {
      filter.followers = {};
      if (minFollowers) filter.followers.$gte = Number(minFollowers);
      if (maxFollowers) filter.followers.$lte = Number(maxFollowers);
    }

    const skip = (page - 1) * limit;

    const influencers = await Profile.find(filter)
      .populate("user", "email")
      .skip(skip)
      .limit(Number(limit));

    const brandId = req.user.id;

    const data = await Promise.all(
      influencers.map(async (inf) => {

        const unlocked = await ContactUnlock.findOne({
          brandId,
          creatorId: inf.user._id
        });

        return {
          ...inf.toObject(),

          email: unlocked ? inf.user.email : null,
          phone: unlocked ? inf.phone : null,
          instagram: unlocked ? inf.instagram : null
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
      "platform",
      "companyName",
      "website",
      "industry",
      "profileImage"
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

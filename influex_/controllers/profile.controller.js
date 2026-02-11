import Profile from "../models/profile.js";

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
};

import express from "express";
import Profile from "../models/profile.js"; 
import { 
  createProfile, 
  getMyProfile, 
  getInfluencers, 
  getBrands ,
  updateProfile
} from "../controllers/profile.controller.js";

import auth, { authorizeRoles } from "../middlewares/auth.middleware.js";



const router = express.Router();

router.post("/", auth, createProfile);
router.get("/me", auth, getMyProfile);
// GET profile by userId (for notifications, view profile etc.)
router.get(
  "/user/:userId",
  auth,
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.params.userId })
        .populate("user", "name email role");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.json({
        success: true,
        profile,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);


router.get(
  "/influencers",
  auth,
  authorizeRoles("brand"),
  getInfluencers
);

router.get(
  "/brands",
  auth,
  authorizeRoles("influencer"),
  getBrands
);

router.put(
  "/",
  auth,
  updateProfile
)




export default router;

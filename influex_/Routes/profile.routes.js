import express from "express";
import { createProfile, getMyProfile } from "../controllers/profile.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createProfile);
router.get("/me", auth, getMyProfile);


router.get(
  "/influencers",
  verifyToken,
  authorizeRoles("brand"),
  getInfluencers
);

router.get(
  "/brands",
  verifyToken,
  authorizeRoles("influencer"),
  getBrands
);

export default router;

import express from "express";
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

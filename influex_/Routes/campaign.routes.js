import express from "express";
import auth from "../middlewares/auth.middleware.js";

import {
  createCampaign,
  matchingCampaigns,
  completeCampaign
} from "../controllers/Campaign.controller.js";

import Applications  from "../controllers/application.controller.js";

const router = express.Router();

// 👉 CREATE CAMPAIGN (Brand only)
router.post("/", auth, createCampaign);

// 👉 MATCHING CAMPAIGNS (Influencer)
router.get("/matching", auth, matchingCampaigns);

// 👉 COMPLETE CAMPAIGN
router.post("/:id/complete", auth, completeCampaign);

// 👉 GET APPLICATIONS
router.get("/:id/applications", auth, Applications);

export default router;


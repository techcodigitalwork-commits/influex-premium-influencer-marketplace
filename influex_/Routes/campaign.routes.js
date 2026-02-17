import express from "express";
import auth, { authorizeRoles } from "../middlewares/auth.middleware.js";

import {
  createCampaign,
  matchingCampaigns,
  completeCampaign,
  getMyCampaigns
} from "../controllers/Campaign.controller.js";

import { getApplications } from "../controllers/application.controller.js";
import { applyToCampaign } from "../controllers/application.controller.js";
import { decideApplication } from "../controllers/application.controller.js";
const router = express.Router();

// CREATE CAMPAIGN (Brand)
router.post("/", auth, authorizeRoles("brand"), createCampaign);

// MATCHING CAMPAIGNS (Influencer)
router.get("/matching", auth, authorizeRoles("influencer"), matchingCampaigns);

// COMPLETE CAMPAIGN
router.post("/:id/complete", auth, authorizeRoles("brand"), completeCampaign);

// GET APPLICATIONS (Brand)
router.get("/:id/applications", auth, authorizeRoles("brand"), getApplications);

// GET MY CAMPAIGNS (Brand)
router.get("/my", auth, authorizeRoles("brand"), getMyCampaigns);
// influencers apply 
router.post(
  "/:id/apply",
  auth,
  authorizeRoles("influencer"),
  applyToCampaign
);
router.put(
  "/applications/:id/decide",
  auth,
  authorizeRoles("brand"),
  decideApplication
);


export default router;

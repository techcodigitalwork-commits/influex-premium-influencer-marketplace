import express from "express";
import auth, { authorizeRoles } from "../middlewares/auth.middleware.js";

import {
  createCampaign,
  matchingCampaigns,
  completeCampaign,
  getMyCampaigns,
  getCampaignById
} from "../controllers/Campaign.controller.js";

import { getApplications } from "../controllers/application.controller.js";
import { applyToCampaign } from "../controllers/application.controller.js";
import { decideApplication } from "../controllers/application.controller.js";

const router = express.Router();

// CREATE CAMPAIGN
router.post("/", auth, authorizeRoles("brand"), createCampaign);

// MATCHING
router.get("/matching", auth, authorizeRoles("influencer"), matchingCampaigns);

// GET MY CAMPAIGNS
router.get("/my", auth, authorizeRoles("brand","influencer"), getMyCampaigns);

// GET APPLICATIONS
router.get("/:id/applications", auth, authorizeRoles("brand"), getApplications);

// APPLY
router.post("/:id/apply", auth, authorizeRoles("influencer"), applyToCampaign);

// COMPLETE
router.post("/:id/complete", auth, authorizeRoles("brand"), completeCampaign);

// DECIDE
router.put("/:id/decide",
  auth,
  authorizeRoles("brand"),
  decideApplication
);
//router.put("/applications/:id/decide", auth, authorizeRoles("brand"), decideApplication);

// ⚠️ ALWAYS LAST
router.get("/:id", auth, getCampaignById);


export default router;

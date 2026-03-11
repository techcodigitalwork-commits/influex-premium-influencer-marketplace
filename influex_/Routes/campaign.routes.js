import express from "express";
import auth, { authorizeRoles } from "../middlewares/auth.middleware.js";

import {
  createCampaign,
  matchingCampaigns,
  completeCampaign,
  getMyCampaigns,
  getCampaignById,
  updateCampaign
} from "../controllers/Campaign.controller.js";

import { getApplications } from "../controllers/application.controller.js";
import { applyToCampaign } from "../controllers/application.controller.js";
import { decideApplication } from "../controllers/application.controller.js";

const router = express.Router();

// =============================
// 🔹 BRAND ROUTES
// =============================

// Create campaign
router.post(
  "/",
  auth,
  authorizeRoles("brand"),
  createCampaign
);

// Brand → see their campaigns
router.get(
  "/my",
  auth,
  authorizeRoles("brand"),
  getMyCampaigns
);

// Brand → get applications of a campaign
router.get(
  "/:id/applications",
  auth,
  authorizeRoles("brand"),
  getApplications
);

// Brand → complete campaign
router.post(
  "/:id/complete",
  auth,
  authorizeRoles("brand"),
  completeCampaign
);

// Brand → accept/reject influencer
router.put(
  "/applications/:id/decide",
  auth,
  authorizeRoles("brand"),
  decideApplication
);



// =============================
// 🔹 INFLUENCER ROUTES
// =============================

// Influencer → get all open campaigns + applied flag
router.get(
  "/all",
  auth,
  authorizeRoles("influencer"),
  getMyCampaigns
);

// Influencer → matching campaigns
router.get(
  "/matching",
  auth,
  authorizeRoles("influencer"),
  matchingCampaigns
);

// Influencer → apply to campaign
router.post(
  "/:id/apply",
  auth,
  authorizeRoles("influencer"),
  applyToCampaign
);



// =============================
// 🔹 COMMON
// =============================

// Get campaign by ID (both can view)
router.get(
  "/:id",
  auth,
  authorizeRoles("brand", "influencer"),
  getCampaignById
);
router.put("/update/:id", auth,
   authorizeRoles("brand"),
   updateCampaign);

export default router;
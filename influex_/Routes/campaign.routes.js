// src/routes/campaign.routes.js
import express from "express";
import { matchingCampaigns } from "../controllers/Campaign.controller.js";
import auth from "../middlewares/auth.js";
import { getApplications } from "../controllers/application.controller.js";




const router = express.Router();

router.get("/matching", auth, matchingCampaigns);
router.post("/:id/complete", auth, completeCampaign);
router.get("/:id/applications", auth, getApplications);

export default router;

import express from "express";
import { sendInvite, respondInvite } from "../controllers/invite.controller.js";
import auth from "../middlewares/auth.middleware.js"; // ensure user is logged in

const router = express.Router();

// Brand sends an invite
router.post("/send", auth, sendInvite);

// Influencer responds to invite (accept/reject)
router.post("/respond", auth, respondInvite);

export default router;
import express from "express";
import { createProfile, getMyProfile } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createProfile);
router.get("/me", protect, getMyProfile);

export default router;

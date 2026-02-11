import express from "express";
import { createProfile, getMyProfile } from "../controllers/profile.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createProfile);
router.get("/me", auth, getMyProfile);

export default router;

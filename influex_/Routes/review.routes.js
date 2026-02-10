import express from "express";
import { createReview } from "../controllers/review.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// Submit review (brand ↔ creator)
router.post("/", auth, createReview);

export default router;

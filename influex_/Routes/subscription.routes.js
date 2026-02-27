import express from "express";
import {
  createRazorpaySubscription,
  purchaseSubscription,
  razorpayWebhook
} from "../controllers/subscription.controller.js";

import auth from "../middlewares/auth.middleware.js"; 
// 👆 jo bhi tum auth middleware use kar rahe ho

const router = express.Router();

// ===============================
// CREATE RAZORPAY SUBSCRIPTION
// ===============================
router.post("/create", auth, createRazorpaySubscription);

// ===============================
// MANUAL SUBSCRIPTION (Optional)
// ===============================
router.post("/activate", auth, purchaseSubscription);

// ===============================
// RAZORPAY WEBHOOK (NO AUTH)
// ===============================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // ⚠️ Important
  razorpayWebhook
);

export default router;
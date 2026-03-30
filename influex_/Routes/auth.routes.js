import express from "express";
import { signup, login,  verifyEmail, forgotPassword, resetPassword, verifyOtp,
  resendOtp, } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;

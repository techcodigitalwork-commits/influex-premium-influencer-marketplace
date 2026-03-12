import express from "express"
import auth from "../middlewares/auth.middleware.js"

import {
 depositPayment,
 verifyPayment,
 approveDeliverable
} from "../controllers/payment.controller.js"

const router = express.Router()

// create razorpay order
router.post("/deposit", auth, depositPayment)

// verify payment and create escrow
router.post("/verify", auth, verifyPayment)

// approve deliverable and release escrow
router.post("/approve-deliverable", auth, approveDeliverable)

export default router
import express from "express"
import auth from "../middlewares/auth.middleware.js"

import {
 depositPayment,
 verifyPayment,
 approveDeliverable,
 submitDeliverable,
 createContact,
  createFundAccount
} from "../controllers/payment.controller.js"

const router = express.Router()

// create razorpay order
router.post("/deposit", auth, depositPayment)

// verify payment and create escrow
router.post("/verify", auth, verifyPayment)

// approve deliverable and release escrow
router.post("/approve-deliverable", auth, approveDeliverable)
//work submit
router.post("/deal/:dealId/submit-deliverable", auth, submitDeliverable)
// 🔥 create contact (influencer)
router.post("/create-contact", auth, createContact);

// 🔥 create fund account (bank link)
router.post("/create-fund-account", auth, createFundAccount);

export default router
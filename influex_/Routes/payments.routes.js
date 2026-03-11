import express from "express"
import auth from "../middlewares/auth.middleware.js"
import {
 depositPayment,
 releasePayment,
 approveDeliverable
} from "../controllers/escrow.controller.js"

const router = express.Router()

// deposit money into escrow
router.post("/deposit", auth, depositPayment)

// release payment manually
router.post("/release", auth, releasePayment)

// approve deliverable and auto release payment
router.post("/approve-deliverable", auth, approveDeliverable)

export default router
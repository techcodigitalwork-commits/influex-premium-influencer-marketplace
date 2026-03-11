import express from "express"
import {createDeal,depositPayment,approveWork} from "../controllers/deal.controller.js"

const router = express.Router()

router.post("/create",createDeal)
router.post("/deposit",depositPayment)
router.post("/approve",approveWork)

export default router
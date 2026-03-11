import express from "express"
import {submitWork,approveDeliverable} from "../controllers/deliverable.controller.js"

const router = express.Router()

router.post("/submit",submitWork)
router.post("/approve",approveDeliverable)

export default router
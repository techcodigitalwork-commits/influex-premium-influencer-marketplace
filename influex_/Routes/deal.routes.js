import express from "express"
import {createDeal,depositPayment,approveWork,getMyDeals,getDealById,getCampaignDeals} from "../controllers/deal.controller.js"
import auth from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/create",auth,createDeal)
router.post("/deposit",auth,depositPayment)
router.post("/approve",auth,approveWork)
router.get("/my",auth,getMyDeals)
router.get("/:id",auth,getDealById)
router.get("/campaign/:campaignId",auth,getCampaignDeals)

export default router;
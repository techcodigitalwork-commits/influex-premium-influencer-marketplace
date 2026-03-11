import express from "express"
import {sendInvite} from "../controllers/invite.controller.js"

const router = express.Router()

router.post("/send",sendInvite)

export default router
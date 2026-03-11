import express from "express"
import {unlockContact} from "../controllers/contact.controller.js"

const router = express.Router()

router.post("/unlock",unlockContact)

export default router
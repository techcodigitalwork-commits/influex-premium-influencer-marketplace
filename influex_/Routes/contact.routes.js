import express from "express"
import {unlockContact} from "../controllers/contact.controller.js"
import auth from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/unlock",auth,unlockContact)

export default router
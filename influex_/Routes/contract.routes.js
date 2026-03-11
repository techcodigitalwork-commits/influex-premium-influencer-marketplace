import express from "express"
import {createContract,signContract} from "../controllers/contract.controller.js"
import auth from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/create",auth,createContract)
router.post("/sign",auth,signContract)

export default router
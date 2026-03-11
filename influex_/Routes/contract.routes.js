import express from "express"
import {createContract,signContract} from "../controllers/contract.controller.js"

const router = express.Router()

router.post("/create",createContract)
router.post("/sign",signContract)

export default router
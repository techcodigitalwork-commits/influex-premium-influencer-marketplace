import express from "express"
import {createContract,signContract, getMyContracts,
 getContract} from "../controllers/contract.controller.js"
import auth from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/create",auth,createContract)
router.post("/sign",auth,signContract)
router.get("/my",auth,getMyContracts)   // brand ke contracts
router.get("/:id",auth,getContract)     // single contract
export default router
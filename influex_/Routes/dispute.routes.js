import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { raiseDispute } from "../controllers/dispute.controller.js";
const router = express.Router();

router.post("/disputes",auth,raiseDispute)
export default router;



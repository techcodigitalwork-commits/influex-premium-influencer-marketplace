// src/routes/application.routes.js
import express from "express";
import { decideApplication } from "../controllers/application.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/:id/decision", auth, decideApplication);

export default router;

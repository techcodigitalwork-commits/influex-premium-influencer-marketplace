// src/routes/application.routes.js
import express from "express";
import { decideApplication ,getMyApplications} from "../controllers/application.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:id/decision", auth, decideApplication);

router.get("/my", auth, getMyApplications);
export default router;

// src/routes/discover.routes.js
import express from "express";
import { search } from "../controllers/discover.controller.js";

const router = express.Router();

router.get("/search",auth, search);

export default router;

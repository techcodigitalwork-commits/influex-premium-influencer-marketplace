// src/routes/public.routes.js
import express from "express";
import {
  featured,
  stats,
  topCities
} from "../controllers/public.controller.js";

const router = express.Router();

router.get("/featured", featured);
router.get("/stats", stats);
router.get("/top-cities", topCities);

export default router;

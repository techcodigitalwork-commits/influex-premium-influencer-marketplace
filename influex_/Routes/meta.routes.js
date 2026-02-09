// src/routes/meta.routes.js
import express from "express";
import { getCities } from "../controllers/meta.controller.js";

const router = express.Router();

router.get("/cities", getCities);

export default router;

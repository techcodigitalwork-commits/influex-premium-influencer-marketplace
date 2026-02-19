// src/routes/meta.routes.js
import express from "express";
import { getCities,getCategories } from "../controllers/meta.controller.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/categories", getCategories);

export default router;

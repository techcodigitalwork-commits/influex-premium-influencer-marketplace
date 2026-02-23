import express from "express";
import { testUpload } from "../controllers/s3controller.js";

const router = express.Router();

router.get("/test-s3", testUpload);

export default router;
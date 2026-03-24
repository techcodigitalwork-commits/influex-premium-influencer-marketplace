import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js"; // image
import video from "../middlewares/video.middleware.js";   // video
import { uploadVideos, getAllVideos } from "../controllers/s3controller.js";

const router = express.Router();

// ✅ IMAGE UPLOAD (S3 direct)
router.post(
  "/upload/image",
  auth,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    res.json({
      success: true,
      url: req.file.location
    });
  }
);

// 🔥 VIDEO UPLOAD (MAX 2 + COMPRESSION)
router.post(
  "/upload/videos",
  auth,
  video.array("videos", 2), // ✅ FIXED
  uploadVideos
);
router.get("/videos", auth, getAllVideos);
export default router;
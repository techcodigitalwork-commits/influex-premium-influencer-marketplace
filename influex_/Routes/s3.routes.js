import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js"; // image
import videoUpload from "../middlewares/video.middleware.js";  // video
import { uploadPost, getAllPosts, getPostsByUser } from "../controllers/s3controller.js";

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
  "/create-post",
  auth,
  videoUpload.array("videos", 2), // 👈 videos
  uploadPost
);
router.get("/posts", auth, getAllPosts);
router.get("/posts/:userId", auth, getPostsByUser);
export default router;
import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  uploadPost,
  getAllPosts,
  getPostsByUser,
  deletePost,
  updatePost
} from "../controllers/post.controller.js"; // 🔥 rename from s3controller

const router = express.Router();

const BASE_URL = "https://api.collabzy.in";


// ✅ IMAGE UPLOAD (LOCAL)
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

    const url = `${BASE_URL}/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      url
    });
  }
);


// 🔥 CREATE POST (IMAGES + VIDEOS TOGETHER)
router.post(
  "/create-post",
  auth,
  upload.array("media", 5), // 👈 images + videos dono
  uploadPost
);


// 📥 GET POSTS
router.get("/posts", auth, getAllPosts);
router.get("/posts/:userId", auth, getPostsByUser);


// 🧹 DELETE
router.delete("/post/:id", auth, deletePost);


// ✏️ UPDATE POST
router.put(
  "/post/:id",
  auth,
  upload.array("media", 5),
  updatePost
);

export default router;
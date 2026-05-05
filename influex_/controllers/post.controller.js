import fs from "fs";
import path from "path";
import { compressVideo } from "../utils/compress.js";
import Video from "../models/video.js";

const BASE_URL = "https://api.collabzy.in"; // 🔥 change if needed

export const uploadPost = async (req, res) => {
  try {
    const files = req.files || [];

    const videoUrls = [];
    const imageUrls = [];

    for (let file of files) {
      const inputPath = file.path;

      // 🎥 VIDEO
      if (file.mimetype.startsWith("video/")) {
        const outputPath = `uploads/compressed/${file.filename}.mp4`;

        await compressVideo(inputPath, outputPath);

        const url = `${BASE_URL}/uploads/compressed/${file.filename}.mp4`;
        videoUrls.push(url);

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      }

      // 🖼 IMAGE
      if (file.mimetype.startsWith("image/")) {
        const url = `${BASE_URL}/uploads/images/${file.filename}`;
        imageUrls.push(url);
      }
    }

    const newPost = await Video.create({
      user: req.user._id,
      urls: videoUrls,
      images: imageUrls,
      caption: req.body.caption || "",
    });

    res.json({ success: true, data: newPost });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Video.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deleteFile = (url) => {
      const filePath = "." + url.replace("https://api.collabzy.in", "");
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    };

    post.urls.forEach(deleteFile);
    post.images.forEach(deleteFile);

    await post.deleteOne();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;

    const url = `https://api.collabzy.in/uploads/profiles/${file.filename}`;

    req.user.profileImage = url;
    await req.user.save();

    res.json({ success: true, url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
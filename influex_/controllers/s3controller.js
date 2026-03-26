// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { s3 } from "../config/s3.js";

// export const testUpload = async (req, res) => {
//   try {
//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: "test-file.txt",
//       Body: "Hello from Influex 🚀",
//       ContentType: "text/plain",
//     });

//     await s3.send(command);

//     res.json({ message: "File uploaded successfully to S3" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// };
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import { compressVideo } from "../utils/compress.js";
import Video from "../models/video.js";

export const uploadPost = async (req, res) => {
  try {
    const files = req.files; // 👈 videos (max 2)
    const uploadedVideoUrls = [];

    // 🎥 VIDEO UPLOAD + COMPRESS
    if (files && files.length > 0) {
      for (let file of files) {
        const inputPath = file.path;
        const outputPath = `uploads/compressed-${file.filename}.mp4`;

        await compressVideo(inputPath, outputPath);

        const fileStream = fs.createReadStream(outputPath);

        const key = `videos/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentType: "video/mp4",
        });

        await s3.send(command);

        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
        uploadedVideoUrls.push(url);

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      }
    }

    // 🖼️ IMAGES (frontend se direct URLs aayengi)
    const imageUrls = req.body.images || [];

    // 🔥 FINAL SAVE (combined post)
    const newPost = await Video.create({
      user: req.user._id,
      urls: uploadedVideoUrls,
      images: imageUrls,
      caption: req.body.caption || "",
    });

    res.json({
      message: "Post created successfully",
      data: newPost,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Video.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      ...post._doc,
      media: [
        ...(post.images || []),
        ...(post.urls || [])
      ]
    }));

    res.json({
      success: true,
      data: formattedPosts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET /posts/:userId
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Video.find({ user: req.params.userId })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    const formatted = posts.map(post => ({
      ...post._doc,
      media: [
        ...(post.images || []),
        ...(post.urls || [])
      ]
    }));

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
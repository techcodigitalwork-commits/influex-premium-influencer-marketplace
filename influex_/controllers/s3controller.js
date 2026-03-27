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
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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


export const deletePost = async (req, res) => {
  try {
    const post = await Video.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Only owner can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🧹 Delete videos from S3
    if (post.urls && post.urls.length > 0) {
      for (let url of post.urls) {
        const key = url.split(".amazonaws.com/")[1];

        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        });

        await s3.send(command);
      }
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
export const updatePost = async (req, res) => {
  try {
    const post = await Video.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Only owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let uploadedVideoUrls = [...(post.urls || [])];

    // 🎥 New videos upload (optional)
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
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

    // 🖼️ Images update
    const imageUrls = req.body.images || post.images;

    // ✏️ Update fields
    post.caption = req.body.caption || post.caption;
    post.images = imageUrls;
    post.urls = uploadedVideoUrls;

    await post.save();

    res.json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
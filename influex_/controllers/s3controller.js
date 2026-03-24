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

export const uploadVideos = async (req, res) => {
  try {
    const files = req.files; // 👈 max 2 videos
    const uploadedUrls = [];

    for (let file of files) {
      const inputPath = file.path;
      const outputPath = `uploads/compressed-${file.filename}.mp4`;

      // 🔥 compress
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
      uploadedUrls.push(url);

      // 🧹 delete temp files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }

    res.json({
      message: "Videos uploaded & compressed",
      urls: uploadedUrls,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: videos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export const testUpload = async (req, res) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "test-file.txt",
      Body: "Hello from Influex 🚀",
      ContentType: "text/plain",
    });

    await s3.send(command);

    res.json({ message: "File uploaded successfully to S3" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
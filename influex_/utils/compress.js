import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

export const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf scale=720:-2",
        "-vcodec libx264",
       "-crf 28",
  "-maxrate 1000k",
  "-bufsize 2000k",
        "-preset fast",
        "-movflags +faststart"
      ])
      .save(outputPath)
      .on("end", () => {
        console.log("✅ Video compressed");
          // 🔥 YAHI ADD KARNA HAI
      const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
const compressedSize = fs.statSync(outputPath).size / (1024 * 1024);

console.log("📦 Original:", originalSize.toFixed(2), "MB");
console.log("📦 Compressed:", compressedSize.toFixed(2), "MB");
        resolve();
      })
      .on("error", (err) => {
        console.log("❌ Compression error:", err);
        reject(err);
      });
  });
};
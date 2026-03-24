import ffmpeg from "fluent-ffmpeg";

export const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf scale=720:-2",
        "-vcodec libx264",
        "-crf 28",
        "-preset fast"
      ])
      .save(outputPath)
      .on("end", () => {
        console.log("✅ Video compressed");
        resolve();
      })
      .on("error", (err) => {
        console.log("❌ Compression error:", err);
        reject(err);
      });
  });
};
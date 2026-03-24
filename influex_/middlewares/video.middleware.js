import multer from "multer";

const uploadVideo = multer({
  dest: "uploads/",

  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files allowed"), false);
    }
  },
});

export default uploadVideo;
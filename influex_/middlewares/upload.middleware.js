import multer from "multer";
import fs from "fs";
import path from "path";

// 📁 folders
const paths = {
  profile: "uploads/profiles",
  image: "uploads/images",
  video: "uploads/videos",
};

// ensure all folders exist
Object.values(paths).forEach((p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      if (req.baseUrl.includes("profile")) {
        cb(null, paths.profile);
      } else {
        cb(null, paths.image);
      }
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, paths.video);
    }
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default upload;
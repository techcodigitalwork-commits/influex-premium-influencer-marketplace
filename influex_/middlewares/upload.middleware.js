import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3.js";

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "influex-profile-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `profiles/${Date.now()}-${file.originalname}`);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  },
});

export default upload;
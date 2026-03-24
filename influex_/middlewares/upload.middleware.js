import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3.js";

const uploadImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `images/${Date.now()}-${file.originalname}`);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  },
});

export default uploadImage;
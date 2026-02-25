import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3.js";
console.log("UPLOAD FILE BUCKET:", process.env.AWS_BUCKET_NAME);

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `profiles/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default upload;
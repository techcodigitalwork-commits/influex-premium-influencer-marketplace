import AWS from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "ap-southeast-2",
});

const BUCKET = "influex-profile-images";
const BASE_DIR = "./public/uploads";

const downloadAllImages = async () => {
  const data = await s3.listObjectsV2({ Bucket: BUCKET }).promise();

  for (const file of data.Contents) {
    const key = file.Key; // e.g. profiles/abc.png

    const filePath = path.join(BASE_DIR, key);

    // 🔥 create folder if not exist
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const params = {
      Bucket: BUCKET,
      Key: key,
    };

    const fileStream = fs.createWriteStream(filePath);
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream.pipe(fileStream);

    console.log("Downloaded:", key);
  }
};

downloadAllImages();
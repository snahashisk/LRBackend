import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../../configs/config.js";

const s3Client = new S3Client({
  endpoint: config.BUCKET_ENDPOINT, // http://garage:3900
  region: "garage",
  credentials: {
    accessKeyId: config.BUCKET_ACCESS_KEY,
    secretAccessKey: config.BUCKET_SECRET_KEY,
  },
  forcePathStyle: true,
});

export { s3Client };

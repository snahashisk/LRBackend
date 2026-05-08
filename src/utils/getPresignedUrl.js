import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./connectBucket.js";
import { config } from "../../configs/config.js";

const getPresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: config.BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 60, // 1 minute
  });

  return url;
};

export { getPresignedUrl };

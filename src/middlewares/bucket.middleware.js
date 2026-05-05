import multer from "multer";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import connectBucket from "../utils/connectBucket.js";
import { AsyncHandler } from "../utils/ asyncHandler.js";

export const uploadUserAvatar = AsyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const fileBuffer = fs.readFileSync(req.file.path);

  const params = {
    Bucket: "bucket-name",
    Key: `user-avatars/${Date.now()}-${req.file.originalname}`,
    Body: fileBuffer,
    ContentType: req.file.mimetype,
  };

  await connectBucket.send(new PutObjectCommand(params));

  fs.unlinkSync(req.file.path);

  next();
});

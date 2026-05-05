import { Worker } from "bullmq";
import { redisConnection } from "./redis.js";
import { uploadOnCloudinary } from "./cloudinary.js";
import { uploadToOpeninary } from "./openInary.js";
import { User } from "../models/user.model.js";
import { mailSender } from "./mailSender.js";
import { otpEmailTemplate } from "../contants.js";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../utils/connectBucket.js";
import { config } from "../../configs/config.js";

export const startAvatarWorker = () => {
  const worker = new Worker(
    "avatar-upload",
    async (job) => {
      console.log("Job received:", job.data);
      const { userId, avatarLocalPath, email, otp } = job.data;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const fileBuffer = fs.readFileSync(avatarLocalPath);
      const key = `avatar/${userId}${Date.now()}.jpeg`;

      const uploadParams = {
        Bucket: config.BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: "image/jpeg",
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log("File uploaded to S3 bucket successfully");

      //trying upload on openinary
      const openinaryResponse = await uploadToOpeninary(avatarLocalPath);
      if (!openinaryResponse) {
        throw new Error("Failed to upload to Openinary");
      }

      //trying upload on openinary
      // const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
      // if (!cloudinaryResponse?.url) {
      //   throw new Error("Failed to upload to Cloudinary");
      // }

      //upload to s3 bucket

      const avatarUrl = config.OPENINARY_BASE_URL + openinaryResponse;
      user.avatar = avatarUrl;
      await user.save({ validateBeforeSave: false });

      const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Profile Picture Updated!</h2>
        <p>Hello,</p>
        <p>fullName : ${user.fullName}</p>
        <p>Email : ${user.email}</p>
        <img src="${avatarUrl}" alt="Profile Picture">
        <p>OTP : ${otp}</p>
        <p>Your profile picture has been successfully uploaded to the server.</p>
        <p>Thank you for updating your information.</p>
        <p>Best regards,<br>DoItNow Team</p>
      </div>
      `;

      await mailSender({ to: email, subject: "Profile Picture Updated", html: message });
    },
    { connection: redisConnection, concurrency: 2 },
  );

  worker.on("completed", (job) => {
    console.log("Worker completed", job.id);
  });

  worker.on("failed", (job, err) => {
    console.log("Worker failed:", err.message);
  });

  return worker;
};

export const startOtpEmailWorker = () => {
  const worker = new Worker(
    "otp-email-send",
    async (job) => {
      console.log("Job received:", job.data);
      const { email, otp } = job.data;

      const message = otpEmailTemplate(otp, email);

      await mailSender({ to: email, subject: "OTP for Your Account", html: message });
    },
    { connection: redisConnection, concurrency: 2 },
  );

  worker.on("completed", (job) => {
    console.log("Worker completed", job.id);
  });

  worker.on("failed", (job, err) => {
    console.log("Worker failed:", err.message);
  });

  return worker;
};

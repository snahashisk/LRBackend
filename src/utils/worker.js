import { Worker } from "bullmq";
import { redisConnection } from "./redis.js";
import { uploadOnCloudinary } from "./cloudinary.js";
import { User } from "../models/user.model.js";
import { mailSender } from "./mailSender.js";
import { otpEmailTemplate } from "../contants.js";

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

      const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);

      if (!cloudinaryResponse?.url) {
        throw new Error("Failed to upload to Cloudinary");
      }

      user.avatar = cloudinaryResponse.url;
      await user.save({ validateBeforeSave: false });

      const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Profile Picture Updated!</h2>
        <p>Hello,</p>
        <p>fullName : ${user.fullName}</p>
        <p>Email : ${user.email}</p>
        <img src="${cloudinaryResponse.url}" alt="Profile Picture">
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

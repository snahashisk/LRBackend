import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const avatarQueue = new Queue("avatar-upload", {
  connection: redisConnection,
});

export const otpEmailQueue = new Queue("otp-email-send", {
  connection: redisConnection,
});

export const pdfQueue = new Queue("pdf-upload", {
  connection: redisConnection,
});

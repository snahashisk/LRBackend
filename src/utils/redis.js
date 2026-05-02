import IORedis from "ioredis";
import { config } from "../../configs/config.js";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully");
});

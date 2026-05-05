import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB,
  REDIS_URL: process.env.REDIS_URL,
  BUCKET_ACCESS_KEY: process.env.BUCKET_ACCESS_KEY,
  BUCKET_SECRET_KEY: process.env.BUCKET_SECRET_KEY,
  BUCKET_NAME: process.env.BUCKET_NAME,
  BUCKET_ENDPOINT: process.env.BUCKET_ENDPOINT,
  OPENINARY_API: process.env.OPENINARY_API,
  OPENINARY_BASE_URL: process.env.OPENINARY_BASE_URL,
};

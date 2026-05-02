import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const healthCheck = asyncHandler(async (req, res) => {
  const health = {
    database: "Disconnected",
    uptime: "",
  };

  try {
    const dbStatus = mongoose.connection.readyState;
    health.database = dbStatus === 1 ? "Connected" : "Connecting";
    health.uptime = process.uptime();

    if (dbStatus !== 1) {
      throw new ApiError(503, "Database is not ready.");
    }

    return res.status(200).json(new ApiResponse(200, health, "Server is healthy!!"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Error while connecting to DB");
  }
});

const serverTime = asyncHandler(async (req, res) => {
  const currentTime = new Date().toISOString();
  console.log(currentTime);
  return res.status(200).json(new ApiResponse(200, { currentTime }, "Server time fetched successfully"));
});

export { healthCheck, serverTime };

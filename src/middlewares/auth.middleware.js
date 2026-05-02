import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { config } from "../../configs/config.js";
import bcrypt from "bcrypt";
import { avatarQueue } from "../utils/queue.js";

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  try {
    await avatarQueue.add("upload-avatar", {
      userId: "123",
      filePath: "/path/to/file",
    });

    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) throw new ApiError(401, "Invalid Access Token");

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Can not verify access token");
  }
});

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, config.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) throw new ApiError(401, "Invalid Access Token");

    const isTokenMatched = bcrypt.compare(token, user.refreshToken);
    if (!isTokenMatched) throw new ApiError(401, "Invalid Refresh Token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(500, "Something went wrong while verifying refresh token");
  }
});

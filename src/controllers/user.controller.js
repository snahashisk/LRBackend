import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { avatarQueue, otpEmailQueue } from "../utils/queue.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Actual token generation error:", error);
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, education, profession, avatar } = req.body;

  if (!fullName || !email || !password || !education || !profession) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  let avatarLocalPath = "";
  if (req.file) {
    avatarLocalPath = req.file.path;
    console.log(avatarLocalPath, "localPath");
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = Date.now() + 1 * 60 * 1000; // 1 min from now

  const user = await User.create({ fullName, email, password, education, profession, otp: hashedOtp, otpExpiry });
  const createdUser = await User.findById(user._id).select("-password");

  if (avatarLocalPath) {
    await avatarQueue.add(
      "uploadAvatar",
      {
        userId: user._id,
        avatarLocalPath,
        email: user.email,
        otp,
      },
      {
        attempts: 3,
        backoff: {
          delay: 2000,
          type: "exponential",
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  } else {
    console.log("avatarLocalPath is not comming here, avatar file is missing");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, "Email and password are required");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  const isPasswordMatched = await user.isPasswordMatched(password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"));
});

const verifyUserOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  const isOtpMatched = await bcrypt.compare(otp, user.otp);
  if (!isOtpMatched) throw new ApiError(401, "Invalid OTP");
  if (user.otpExpiry < Date.now()) throw new ApiError(401, "OTP expired");

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      isVerified: true,
      $unset: { otp: "", otpExpiry: "" },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "OTP Verified successfully"));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.otpExpiry && Date.now() < user.otpExpiry) {
    throw new ApiError(400, "OTP already sent. Please wait.");
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = Date.now() + 1 * 60 * 1000; // 1 min from now

  user.otp = hashedOtp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  await otpEmailQueue.add("sendOtp", { email: user.email, otp });

  return res.status(200).json(new ApiResponse(200, {}, "Check your email for new OTP"));
});

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Access Token Refreshed Successfully"));
});

export { registerUser, loginUser, getMe, refreshAccessToken, verifyUserOtp, resendOtp };

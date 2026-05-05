import { Router } from "express";
import {
  getMe,
  loginUser,
  refreshAccessToken,
  registerUser,
  verifyUserOtp,
  resendOtp,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(upload.single("avatar"), registerUser);

authRouter.route("/verify-otp").post(verifyUserOtp);

authRouter.route("/resend-otp").post(resendOtp);

authRouter.route("/login").post(loginUser);

authRouter.route("/me").get(verifyAccessToken, getMe);

authRouter.route("/refresh-token").get(verifyRefreshToken, refreshAccessToken);

authRouter.route("/logout").post(verifyAccessToken, logoutUser);

export default authRouter;

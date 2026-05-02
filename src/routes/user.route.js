import { Router } from "express";
import { getMe, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(upload.single("avatar"), registerUser);

authRouter.route("/login").post(loginUser);

authRouter.route("/me").get(verifyAccessToken, getMe);

authRouter.route("/refresh-token").get(verifyRefreshToken, refreshAccessToken);

export default authRouter;

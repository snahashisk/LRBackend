import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "../configs/config.js";

const app = express();

app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes import
import healthCheckRouter from "./routes/health.route.js";
import authRouter from "./routes/user.route.js";
import topicRouter from "./routes/topic.route.js";

//Routes declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

//Topic router
app.use("/api/v1/topic", topicRouter);

//PDF router

export { app };

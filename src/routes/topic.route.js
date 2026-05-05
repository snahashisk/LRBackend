import { Router } from "express";
import { createTopic, getAllTopics, getTopic, updateTopic, deleteTopic } from "../controllers/topic.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const topicRouter = Router();

topicRouter.route("/create-topic").post(verifyAccessToken, createTopic);

topicRouter.route("/:id").get(verifyAccessToken, getTopic);

topicRouter.route("/:id").patch(verifyAccessToken, updateTopic);

topicRouter.route("/:id").delete(verifyAccessToken, deleteTopic);

topicRouter.route("/").get(verifyAccessToken, getAllTopics);

export default topicRouter;

import { Router } from "express";
import { healthCheck, serverTime } from "../controllers/health.controller.js";

const router = Router();

router.route("/check").get(healthCheck);
router.route("/time").get(serverTime);

export default router;

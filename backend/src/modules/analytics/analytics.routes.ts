import { Router } from "express";
import * as Controller from "./analytics.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/analytics/dashboard
router.get("/dashboard", authenticate, Controller.getDashboardAnalytics);

export default router;
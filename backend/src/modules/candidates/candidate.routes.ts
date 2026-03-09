import { Router } from "express";
import * as Controller from "./candidate.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// 1. Static Routes (Must come first)
router.get("/my-leads", authenticate, Controller.getMyLeads);
router.get("/meta/statuses", authenticate, Controller.getStatuses); 
router.post("/", authenticate, Controller.addCandidate);

// 2. Dynamic Routes (Parameterized)
router.get("/:id", authenticate, Controller.getCandidateById);
router.post("/:id/status", authenticate, Controller.appendCandidateStatus);

export default router;
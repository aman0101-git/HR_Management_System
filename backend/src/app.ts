import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import candidateRoutes from "./modules/candidates/candidate.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);

export default app;

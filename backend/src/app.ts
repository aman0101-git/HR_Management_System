import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import candidateRoutes from "./modules/candidates/candidate.routes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

export default app;

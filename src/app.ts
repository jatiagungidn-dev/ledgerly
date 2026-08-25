import express, { Request, Response, NextFunction } from "express";

import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";
import { authenticate } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(express.json());

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "success",
      service: "Ledgerly",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      service: "Ledgerly",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/me", authenticate, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

app.use("/api/auth", authRouter);

app.use((_req: Request, res: Response) => {
  return res
    .status(404)
    .json({ status: "fail", message: "Cannot find the route here" });
});

app.use(errorHandler);

export default app;

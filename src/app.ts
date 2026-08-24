import express, { Request, Response, NextFunction } from "express";
import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";

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

app.use("/api/auth", authRouter);

app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ status: "fail", message: "Cannot find the route here" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const error_message = console.error("Internal Server Error", err.stack);
  res.status(500).json({ status: "error", message: error_message });
});

export default app;

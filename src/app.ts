import express, { Request, Response } from "express";
import cors from "cors";

import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";
import accountRouter from "./modules/accounts/account.routes";
import categoryRouter from "./modules/categories/category.routes";
import budgetRouter from "./modules/budgets/budget.routes";
import journalRouter from "./modules/journals/journal.routes";
import { authenticate } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

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

app.use("/api/account", accountRouter);

app.use("/api/category", categoryRouter);

app.use("/api/budget", budgetRouter);

app.use("/api/journal", journalRouter);

app.use((_req: Request, res: Response) => {
  return res
    .status(404)
    .json({ status: "fail", message: "Cannot find the route here" });
});

app.use(errorHandler);

export default app;

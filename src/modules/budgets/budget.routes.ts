import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createBudget } from "./budget.controller";

const router = Router();

router.post("/", authenticate, createBudget);

export default router;

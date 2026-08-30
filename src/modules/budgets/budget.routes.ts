import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createBudget,
  deleteBudget,
  getBudgetById,
  getBudgets,
  updateBudget,
} from "./budget.controller";

const router = Router();

router.use(authenticate);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/:id", getBudgetById);
router.patch("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;

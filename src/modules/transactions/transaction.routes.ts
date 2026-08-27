import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
} from "./transaction.controller";

const router = Router();

router.post("/", authenticate, createTransaction);
router.get("/", authenticate, getTransactions);
router.get("/", authenticate, getTransactionById);

export default router;

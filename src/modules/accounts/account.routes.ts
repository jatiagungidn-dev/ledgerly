import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createAccount,
  getAccountById,
  getAccounts,
} from "./account.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createAccount);
router.get("/", getAccounts);
router.get("/:id", getAccountById);

export default router;

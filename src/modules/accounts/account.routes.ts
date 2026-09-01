import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createAccount,
  getAccountById,
  getAccounts,
  updateAccount,
  deleteAccount,
} from "./account.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createAccount);
router.get("/", getAccounts);
router.get("/:id", getAccountById);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;

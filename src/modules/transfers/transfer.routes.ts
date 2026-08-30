import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createTransfer,
  getTransfers,
  getTransferById,
} from "./transfer.controller";

const router = Router();

router.use(authenticate);

router.post("/", createTransfer);
router.get("/", getTransfers);
router.get("/:id", getTransferById);

export default router;

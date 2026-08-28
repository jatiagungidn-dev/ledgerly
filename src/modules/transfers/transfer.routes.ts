import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createTransfer, getTransfers } from "./transfer.controller";

const router = Router();

router.post("/", authenticate, createTransfer);
router.get("/", authenticate, getTransfers);

export default router;

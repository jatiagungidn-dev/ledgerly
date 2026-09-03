import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createJournal,
  getJournalById,
  getJournals,
} from "./journal.controller";

const router = Router();

router.use(authenticate);

router.get("/", getJournals);
router.get("/:id", getJournalById);
router.post("/", createJournal);

export default router;

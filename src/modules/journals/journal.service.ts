import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import {
  createJournal,
  findJournalByUserId,
  findJournalById,
  findJournalByIdempotencyKey,
  countUserAccounts,
} from "./journal.repository";
import { CreateJournalInput } from "./journal.schema";

export const create = async (userId: string, data: CreateJournalInput) => {
  const existingJournal = await findJournalByIdempotencyKey(
    data.idempotencyKey,
  );

  if (existingJournal) {
    if (existingJournal.userId !== userId) {
      throw new AppError(409, "Idempotency key conflict");
    }
    return existingJournal;
  }

  const accountIds = Array.from(new Set(data.entries.map((e) => e.accountId)));

  let totalDebit = new Prisma.Decimal(0);
  let totalCredit = new Prisma.Decimal(0);

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const userAccountsCount = await countUserAccounts(userId, accountIds, tx);

    if (userAccountsCount !== accountIds.length) {
      throw new AppError(
        403,
        "Forbidden: One or more accounts don't belong to user",
      );
    }

    if (!data.entries || data.entries.length === 0) {
      throw new AppError(400, "Journal must have at least one entry");
    }

    for (const entry of data.entries) {
      const amt = new Prisma.Decimal(entry.amount);
      if (entry.type === "DEBIT") {
        totalDebit = totalDebit.add(amt);
      } else if (entry.type === "CREDIT") {
        totalCredit = totalCredit.add(amt);
      } else {
        throw new AppError(400, "Invalid entry type");
      }
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new AppError(400, "Debits and credits must be equal");
    }

    return await createJournal(userId, data, tx);
  });
};

export const getAll = async (userId: string) => {
  return await findJournalByUserId(userId);
};

export const getById = async (id: string, userId: string) => {
  const journal = await findJournalById(id, userId);

  if (!journal) {
    throw new AppError(404, "Journal not found");
  }

  return journal;
};

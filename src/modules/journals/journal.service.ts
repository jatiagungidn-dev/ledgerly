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
  const existringJournal = await findJournalByIdempotencyKey(
    data.idempotencyKey,
  );

  if (existringJournal) {
    if (existringJournal.userId !== userId) {
      throw new AppError(409, "Idempotency key conflict");
    }
    return existringJournal;
  }

  const accountIds = Array.from(new Set(data.entries.map((e) => e.accountId)));

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const userAccountsCount = await countUserAccounts(userId, accountIds, tx);

    if (userAccountsCount !== accountIds.length) {
      throw new AppError(
        403,
        "Forbidden: One or more accounts don't belong to user",
      );
    }

    const journalData = {
      ...data,
      entries: data.entries.map((entry) => ({
        ...entry,
        amount: entry.amount.toString(),
      })),
    };

    return await createJournal(userId, journalData, tx);
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

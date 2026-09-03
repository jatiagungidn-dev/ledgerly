import { EntryType, Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

type CreateLedgerEntryData = {
  accountId: string;
  categoryId?: string;
  type: EntryType;
  amount: string;
};

export const createJournal = async (
  userId: string,
  data: {
    idempotencyKey: string;
    description?: string;
    occurredAt: Date;
    entries: CreateLedgerEntryData[];
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.journal.create({
    data: {
      idempotencyKey: data.idempotencyKey,
      description: data.description ?? null,
      occurredAt: data.occurredAt,
      userId: userId,
      entries: {
        create: data.entries.map((entry) => ({
          accountId: entry.accountId,
          categoryId: entry.categoryId ?? null,
          type: entry.type,
          amount: new Prisma.Decimal(entry.amount),
        })),
      },
    },
    include: { entries: { include: { account: true, category: true } } },
  });
};

export const findJournalByUserId = async (
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.journal.findMany({
    where: { userId },
    include: { entries: { include: { account: true, category: true } } },
    orderBy: { occurredAt: "desc" },
  });
};

export const findJournalById = async (
  id: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.journal.findFirst({ where: { id: id, userId } });
};

export const findJournalByIdempotencyKey = async (
  idempotencyKey: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.journal.findUnique({
    where: { idempotencyKey },
    include: { entries: true },
  });
};

export const countUserAccounts = (
  userId: string,
  accountIds: string[],
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.account.count({
    where: {
      id: { in: accountIds },
      userId: userId,
    },
  });
};

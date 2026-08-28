import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const createTransferRecord = async (
  data: {
    fromAccountId: string;
    toAccountId: string;
    amount: Prisma.Decimal;
    description?: string;
    occurredAt: Date;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.transfer.create({
    data: {
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      description: data.description || null,
      occurredAt: data.occurredAt,
    },
  });
};

export const findAccountById = async (
  accountId: string,
  userId?: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  const account = await client.account.findUnique({
    where: { id: accountId },
  });
  if (!account) return null;
  if (userId && account.userId !== userId) return null;
  return account;
};

export const updateBalance = async (
  accountId: string,
  amount: Prisma.Decimal,
  operation: "INCREMENT" | "DECREMENT",
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  const adjustment =
    operation === "INCREMENT" ? { increment: amount } : { decrement: amount };

  return client.account.update({
    where: { id: accountId },
    data: { balance: adjustment },
  });
};

export const findAllTransfers = async (userId: string) => {
  return prisma.transfer.findMany({
    where: {
      OR: [{ fromAccount: { userId } }, { toAccount: { userId } }],
    },
    include: {
      fromAccount: { select: { id: true, name: true, currency: true } },
      toAccount: { select: { id: true, name: true, currency: true } },
    },
    orderBy: { occurredAt: "desc" },
  });
};

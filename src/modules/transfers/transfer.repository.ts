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

export const findAllTransfers = async (userId: string) => {
  return prisma.transfer.findMany({
    where: {
      OR: [{ fromAccount: { userId }, toAccount: { userId } }],
    },
    include: {
      fromAccount: { select: { id: true, name: true, currency: true } },
      toAccount: { select: { id: true, name: true, currency: true } },
    },
    orderBy: { occurredAt: "desc" },
  });
};

export const findTransferById = async (transferId: string, userId: string) => {
  return prisma.transfer.findFirst({
    where: {
      id: transferId,
      OR: [{ fromAccount: { userId } }, { toAccount: { userId } }],
    },
  });
};

import { PrismaClient, TransactionType, Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const createTransactionRecord = async (
  data: {
    accountId: string;
    categoryId?: string;
    type: TransactionType;
    amount: Prisma.Decimal;
    description?: string;
    occurredAt: Date;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.transaction.create({
    data: {
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      occurredAt: data.occurredAt,
    },
  });
};

export const findAccountById = async (
  accountId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  return prisma.account.findFirst({ where: { id: accountId, userId, tx } });
};

export const findCategoryById = async (categoryId: string, userId: string) => {
  return prisma.category.findFirst({ where: { id: categoryId, userId } });
};

export const updateAccountBalance = async (
  accountId: string,
  amount: Prisma.Decimal,
  type: TransactionType,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  const balancedAdjustment =
    type === "INCOME" ? { increment: amount } : { decrement: amount };

  return client.account.update({
    where: { id: accountId },
    data: { balance: balancedAdjustment },
  });
};

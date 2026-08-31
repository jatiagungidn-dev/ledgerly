import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const createAccount = async (
  userId: string,
  data: {
    name: string;
    type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
    currency: string;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.account.create({ data: { ...data, userId } });
};

export const findAccountByUserId = async (userId: string) => {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findAccountById = async (
  id: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.account.findFirst({ where: { id, userId } });
};

export const updateAccount = async (
  id: string,
  userId: string,
  name: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.account.updateMany({ where: { id, userId }, data: { name } });
};

export const deleteAccount = async (
  id: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.account.deleteMany({ where: { id, userId } });
};

export const calculateAccountBalance = async (
  accountId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  const aggregations = await client.ledgerEntry.groupBy({
    by: ["type"],
    where: { accountId },
    _sum: { amount: true },
  });

  let totalDebit = new Prisma.Decimal(0);
  let totalCredit = new Prisma.Decimal(0);

  for (const agg of aggregations) {
    if (agg.type === "DEBIT") {
      totalDebit = agg._sum.amount ?? new Prisma.Decimal(0);
    } else if (agg.type === "CREDIT") {
      totalCredit = agg._sum.amount ?? new Prisma.Decimal(0);
    }
  }

  return totalDebit.minus(totalCredit);
};

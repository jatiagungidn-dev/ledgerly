import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const createBudgetRecord = async (
  data: {
    amount: Prisma.Decimal;
    userId: string;
    categoryId: string;
    periodStart: Date;
    periodEnd: Date;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.create({
    data: {
      amount: data.amount,
      userId: data.userId,
      categoryId: data.categoryId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
    },
  });
};

export const findBudgetById = async (
  budgetId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });
};

export const findBudgetsByUserId = async (
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.findMany({
    where: {
      userId,
    },
    orderBy: {
      periodStart: "desc",
    },
  });
};

export const findOverLappingBudget = async (
  data: {
    userId: string;
    categoryId: string;
    periodStart: Date;
    periodEnd: Date;
    excludeBudgetId?: string;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.findFirst({
    where: {
      userId: data.userId,
      categoryId: data.categoryId,

      ...(data.excludeBudgetId && {
        id: {
          not: data.excludeBudgetId,
        },
      }),

      periodStart: {
        lt: data.periodEnd,
      },

      periodEnd: {
        gt: data.periodStart,
      },
    },
  });
};

export const updateBudgetRecord = async (
  budgetId: string,
  userId: string,
  data: {
    amount?: Prisma.Decimal;
    categoryId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.updateMany({ where: { id: budgetId, userId }, data });
};

export const deleteBudgetRecord = async (
  budgetId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  return client.budget.deleteMany({
    where: {
      id: budgetId,
      userId,
    },
  });
};

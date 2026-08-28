import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { findAccountById, updateAccount } from "../accounts/account.repository";
import { createTransactionRecord } from "./transaction.repository";
import { CreateTransactionInput } from "./transaction.schema";

export const create = async (userId: string, data: CreateTransactionInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    const account = await findAccountById(data.accountId, userId, tx);

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    if (data.type === "EXPENSE" && account.balance.lessThan(amountDecimal)) {
      throw new AppError(400, "Insufficient account balance");
    }

    if (data.categoryId) {
      const category = await tx.category.findFirst({
        where: { id: data.categoryId, userId },
      });

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      if (category.type !== data.type) {
        throw new AppError(400, "Category type doesn't match transaction type");
      }
    }

    const transaction = await createTransactionRecord(
      {
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: amountDecimal,
        description: data.description,
        occurredAt: data.occurredAt,
      },
      tx,
    );

    const balanceAdjustment =
      data.type === "INCOME"
        ? { increment: amountDecimal }
        : { decrement: amountDecimal };

    await tx.account.update({
      where: { id: data.accountId },
      data: { balance: balanceAdjustment },
    });

    return transaction;
  });
};

export const findAll = async (userId: string) => {
  return prisma.transaction.findMany({
    where: {
      account: {
        userId,
      },
    },
    include: {
      account: {
        select: { id: true, name: true, currency: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: {
      occurredAt: "desc",
    },
  });
};

export const findById = async (id: string, userId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      account: {
        userId,
      },
    },
    include: {
      account: {
        select: { id: true, name: true, currency: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  if (!transaction) {
    throw new AppError(404, "Transaction not found");
  }

  return transaction;
};

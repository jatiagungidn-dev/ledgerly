import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { calculateAccountBalance } from "../accounts/account.repository";
import { CreateTransactionInput } from "./transaction.schema";

export const create = async (userId: string, data: CreateTransactionInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: data.accountId, userId },
    });

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    const currentBalance = await calculateAccountBalance(data.accountId, tx);

    if (data.type === "EXPENSE" && currentBalance.lessThan(amountDecimal)) {
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

    const entries = [];

    if (data.type === "EXPENSE") {
      (entries.push({
        account: { connect: { id: data.accountId } },
        type: "CREDIT" as const,
        amount: amountDecimal,
      }),
        entries.push({
          account: { connect: { id: data.categoryId } },
          type: "DEBIT" as const,
          amount: amountDecimal,
        }));
    } else {
      (entries.push({
        account: { connect: { id: data.accountId } },
        type: "DEBIT" as const,
        amount: amountDecimal,
      }),
        entries.push({
          account: { connect: { id: data.categoryId } },
          type: "CREDIT" as const,
          amount: amountDecimal,
        }));
    }

    return tx.journal.create({
      data: {
        userId,
        idempotencyKey: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        description: data.description ?? null,
        occurredAt: data.occurredAt,
        entries: {
          create: entries,
        },
      },
      include: {
        entries: true,
      },
    });
  });
};

export const findAll = async (userId: string) => {
  return prisma.journal.findMany({
    where: {
      userId,
    },
    include: {
      entries: {
        include: {
          account: { select: { id: true, name: true, currency: true } },
        },
      },
    },
    orderBy: {
      occurredAt: "desc",
    },
  });
};

export const findById = async (id: string, userId: string) => {
  const journal = await prisma.journal.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      entries: {
        include: {
          account: { select: { id: true, name: true, currency: true } },
        },
      },
    },
  });

  if (!journal) {
    throw new AppError(404, "Transaction journal not found");
  }

  return journal;
};

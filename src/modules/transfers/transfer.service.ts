import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { calculateAccountBalance } from "../accounts/account.repository";
import { CreateTransferInput } from "./transfer.schema";

export const create = async (userId: string, data: CreateTransferInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    const fromAccount = await tx.account.findFirst({
      where: { id: data.fromAccountId, userId },
    });
    if (!fromAccount) throw new AppError(404, "Source account not found");

    const toAccount = await tx.account.findFirst({
      where: { id: data.toAccountId, userId },
    });
    if (!toAccount) throw new AppError(404, "Target account not found");

    const fromBalance = await calculateAccountBalance(data.fromAccountId, tx);
    if (fromBalance.lessThan(amountDecimal)) {
      throw new AppError(400, "Insufficient account balance");
    }

    return tx.journal.create({
      data: {
        userId,
        idempotencyKey: `trf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        description:
          data.description ??
          `Transfer from ${fromAccount.name} to ${toAccount.name}`,
        occurredAt: data.occurredAt,
        entries: {
          create: [
            {
              accountId: data.fromAccountId,
              type: "CREDIT" as const,
              amount: amountDecimal,
            },
            {
              accountId: data.toAccountId,
              type: "DEBIT" as const,
              amount: amountDecimal,
            },
          ],
        },
      },
      include: { entries: true },
    });
  });
};

export const findAll = async (userId: string) => {
  return prisma.journal.findMany({
    where: {
      userId,
      entries: {
        some: {
          type: "DEBIT",
        },
      },
    },
    include: { entries: true },
    orderBy: { occurredAt: "desc" },
  });
};

export const findById = async (id: string, userId: string) => {
  const journal = await prisma.journal.findFirst({
    where: { id, userId },
    include: { entries: true },
  });

  if (!journal) {
    throw new AppError(404, "Transfer not found");
  }

  return journal;
};

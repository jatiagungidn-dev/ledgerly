import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { findAccountById } from "../accounts/account.repository";
import {
  createTransferRecord,
  findAllTransfers,
  findTransferById,
} from "./transfer.repository";
import { CreateTransferInput } from "./transfer.schema";

export const create = async (userId: string, data: CreateTransferInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    const fromAccount = await findAccountById(data.fromAccountId, userId, tx);
    if (!fromAccount) {
      throw new AppError(404, "Source account not found");
    }

    if (fromAccount.balance.lessThan(amountDecimal)) {
      throw new AppError(400, "Insufficient account balance");
    }

    const toAccount = await findAccountById(data.toAccountId, userId, tx);
    if (!toAccount) {
      throw new AppError(404, "Target account not found");
    }

    const transfer = await createTransferRecord(
      {
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: amountDecimal,
        description: data.description,
        occurredAt: data.occurredAt,
      },
      tx,
    );

    await tx.account.update({
      where: { id: data.fromAccountId },
      data: { balance: { decrement: amountDecimal } },
    });

    await tx.account.update({
      where: { id: data.toAccountId },
      data: { balance: { increment: amountDecimal } },
    });

    return transfer;
  });
};

export const findAll = async (userId: string) => {
  return findAllTransfers(userId);
};

export const findById = async (transferId: string, userId: string) => {
  return findTransferById(transferId, userId);
};

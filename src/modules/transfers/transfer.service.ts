import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import {
  createTransferRecord,
  findAccountById,
  findAllTransfers,
  updateBalance,
} from "./transfer.repository";
import { CreateTransferInput } from "./transfer.schema";

export const create = async (userId: string, data: CreateTransferInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(
    async (tx) => {
      const fromAccount = await findAccountById(data.fromAccountId, userId, tx);
      if (!fromAccount) {
        console.debug({ userId, fromAccountId: data.fromAccountId });
        throw new AppError(404, "Source account not found");
      }

      // Allow transferring to accounts owned by other users by not passing userId
      const toAccount = await findAccountById(data.toAccountId, undefined, tx);
      if (!toAccount) {
        console.debug({ userId, toAccountId: data.toAccountId });
        throw new AppError(404, "Destination account not found");
      }

      if (fromAccount.id === toAccount.id) {
        throw new AppError(400, "Cannot transfer to the same account");
      }

      if (fromAccount.currency !== toAccount.currency) {
        throw new AppError(
          400,
          "Cannot transfer between accounts with different currencies",
        );
      }

      if (fromAccount.balance.lessThan(amountDecimal)) {
        throw new AppError(400, "Insufficient account balance");
      }

      const transfer = await createTransferRecord(
        {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: amountDecimal,
          description: data.description,
          occurredAt: data.occurredAt,
        },
        tx,
      );

      await updateBalance(fromAccount.id, amountDecimal, "DECREMENT", tx);

      await updateBalance(toAccount.id, amountDecimal, "INCREMENT", tx);

      return transfer;
    },
    { timeout: 15000, maxWait: 15000 },
  );
};

export const findAll = async (userId: string) => {
  return findAllTransfers(userId);
};

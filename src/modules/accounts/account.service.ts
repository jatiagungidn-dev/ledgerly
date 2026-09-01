import { Prisma } from "../../generated/prisma";
import { AppError } from "../../utils/app-error";
import {
  createAccount,
  findAccountById,
  findAccountByUserId,
  updateAccount,
  deleteAccount,
  calculateAccountBalance,
  calculateAccountsBalance,
} from "./account.repository";
import { CreateAccountInput } from "./account.schema";

export const create = async (userId: string, data: CreateAccountInput) => {
  return createAccount(userId, data);
};

export const findAll = async (userId: string) => {
  const accounts = await findAccountByUserId(userId);
  const aggregations = await calculateAccountsBalance(userId);

  const balanceMap = new Map<
    string,
    {
      debit: Prisma.Decimal;
      credit: Prisma.Decimal;
    }
  >();

  for (const agg of aggregations) {
    const current = balanceMap.get(agg.accountId) ?? {
      debit: new Prisma.Decimal(0),
      credit: new Prisma.Decimal(0),
    };

    if (agg.type === "DEBIT") {
      current.debit = agg._sum.amount ?? new Prisma.Decimal(0);
    }

    if (agg.type === "CREDIT") {
      current.credit = agg._sum.amount ?? new Prisma.Decimal(0);
    }

    balanceMap.set(agg.accountId, current);
  }

  return accounts.map((account) => {
    const totals = balanceMap.get(account.id) ?? {
      debit: new Prisma.Decimal(0),
      credit: new Prisma.Decimal(0),
    };

    const balance =
      account.type === "ASSET"
        ? totals.debit.minus(totals.credit)
        : totals.credit.minus(totals.debit);

    return {
      ...account,
      balance,
    };
  });
};

export const findById = async (id: string, userId: string) => {
  const account = await findAccountById(id, userId);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  const balance =
    (await calculateAccountBalance(account.id)) ?? new Prisma.Decimal(0);

  return { ...account, balance };
};

export const update = async (id: string, userId: string, name: string) => {
  const account = await findAccountById(id, userId);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  await updateAccount(id, userId, name);

  const balance =
    (await calculateAccountBalance(account.id)) ?? new Prisma.Decimal(0);

  return { ...account, name, balance };
};

export const remove = async (id: string, userId: string) => {
  const account = await findAccountById(id, userId);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  await deleteAccount(id, userId);
};

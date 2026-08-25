import { AppError } from "../../utils/app-error";
import {
  createAccount,
  findAccountById,
  findAccountByUserId,
  updateAccount,
  deleteAccount,
} from "./account.repository";

export const create = async (
  userId: string,
  data: { name: string; type: "CASH" | "BANK" | "E_WALLET"; currency: string },
) => {
  return createAccount(userId, data);
};

export const findAll = async (userId: string) => {
  return findAccountByUserId(userId);
};

export const findById = async (id: string, userId: string) => {
  const account = await findAccountById(id, userId);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  return account;
};

export const update = async (id: string, userId: string, name: string) => {
  const result = await updateAccount(id, userId, name);

  if (result.count === 0) {
    throw new AppError(404, "Account not found");
  }

  return findAccountById(id, userId);
};

export const remove = async (id: string, userId: string) => {
  const result = await deleteAccount(id, userId);

  if (result.count === 0) {
    throw new AppError(404, "Account not found");
  }
};

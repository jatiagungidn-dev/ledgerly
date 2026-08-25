import { prisma } from "../../config/prisma";

export const createAccount = async (
  userId: string,
  data: { name: string; type: "CASH" | "BANK" | "E_WALLET"; currency: string },
) => {
  return prisma.account.create({ data: { ...data, userId } });
};

export const findAccountByUserId = async (userId: string) => {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findAccountById = async (id: string, userId: string) => {
  return prisma.account.findFirst({ where: { id, userId } });
};

export const updateAccount = async (
  id: string,
  userId: string,
  name: string,
) => {
  return prisma.account.updateMany({ where: { id, userId }, data: { name } });
};

export const deleteAccount = async (id: string, userId: string) => {
  return prisma.account.deleteMany({ where: { id, userId } });
};

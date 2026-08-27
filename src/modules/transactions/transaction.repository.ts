import { PrismaClient, TransactionType, Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const findAccountById = async (accountId: string, userId: string) => {
  return prisma.account.findFirst({ where: { id: accountId, userId } });
};

export const findCategoryById = async (categoryId: string, userId: string) => {
  return prisma.category.findFirst({ where: { id: categoryId, userId } });
};

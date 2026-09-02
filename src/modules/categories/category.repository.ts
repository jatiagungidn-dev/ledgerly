import { CategoryType, Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";

export const createCategory = async (
  userId: string,
  data: {
    name: string;
    type: CategoryType;
  },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.create({ data: { ...data, userId } });
};

export const findCategoriesByUserId = async (
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findCategoryById = async (
  id: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.findFirst({
    where: { id, userId },
  });
};

export const updateCategory = async (
  id: string,
  userId: string,
  name: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.updateMany({ where: { id, userId }, data: { name } });
};

export const deleteCategory = async (
  id: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.deleteMany({ where: { id, userId } });
};

export const findCategoryByName = async (
  name: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.category.findUnique({
    where: { userId_name: { name, userId } },
  });
};

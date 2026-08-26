import { prisma } from "../../config/prisma";

export const createCategory = async (
  userId: string,
  data: { name: string; type: "INCOME" | "EXPENSE" },
) => {
  return prisma.category.create({ data: { ...data, userId } });
};

export const findCategoriesByUserId = async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findCategoriesById = async (id: string, userId: string) => {
  return prisma.category.findFirst({
    where: { id, userId },
  });
};

export const updateCategory = async (
  id: string,
  userId: string,
  name: string,
) => {
  return prisma.category.updateMany({ where: { id, userId }, data: { name } });
};

export const deleteCategory = async (id: string, userId: string) => {
  return prisma.category.deleteMany({ where: { id, userId } });
};

export const findCategoryByName = async (name: string, userId: string) => {
  return prisma.category.findUnique({
    where: { userId_name: { name, userId } },
  });
};

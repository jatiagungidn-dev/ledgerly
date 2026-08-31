import { AppError } from "../../utils/app-error";
import {
  createCategory,
  findCategoriesByUserId,
  findCategoriesById,
  updateCategory,
  deleteCategory,
  findCategoryByName,
} from "./category.repository";

export const create = async (
  userId: string,
  data: {
    name: string;
    type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  },
) => {
  const existingCategory = await findCategoryByName(data.name, userId);

  if (existingCategory) {
    throw new AppError(409, "Category already exists");
  }

  return createCategory(userId, data);
};

export const findAll = async (userId: string) => {
  return findCategoriesByUserId(userId);
};

export const findById = async (id: string, userId: string) => {
  const category = await findCategoriesById(id, userId);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
};

export const update = async (id: string, userId: string, name: string) => {
  const result = await updateCategory(id, userId, name);

  if (result.count === 0) {
    throw new AppError(404, "Category not found");
  }

  return findCategoriesById(id, userId);
};

export const remove = async (id: string, userId: string) => {
  const result = await deleteCategory(id, userId);

  if (result.count === 0) {
    throw new AppError(404, "Category not found");
  }
};

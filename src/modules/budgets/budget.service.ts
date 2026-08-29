import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createBudgetRecord, findOverLappingBudget } from "./budget.repository";
import { CreateBudgetInput } from "./budget.schema";
import { findCategoriesById } from "../categories/category.repository";

export const create = async (userId: string, data: CreateBudgetInput) => {
  const amountDecimal = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    if (data.periodStart >= data.periodEnd) {
      throw new AppError(400, "Period start must be before period end");
    }

    const category = await findCategoriesById(data.categoryId, userId, tx);

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    if (category.type !== "EXPENSE") {
      throw new AppError(
        400,
        "Budget can only be created for expense categories",
      );
    }

    const overlappingBudget = await findOverLappingBudget(
      {
        userId,
        categoryId: data.categoryId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
      tx,
    );

    if (overlappingBudget) {
      throw new AppError(
        400,
        "A budget already exists for this category during this period",
      );
    }

    return createBudgetRecord(
      {
        amount: amountDecimal,
        userId,
        categoryId: data.categoryId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
      tx,
    );
  });
};

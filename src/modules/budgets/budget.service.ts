import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import {
  createBudgetRecord,
  findBudget,
  findBudgetById,
  findOverLappingBudget,
  updateBudgetRecord,
  deleteBudgetRecord,
} from "./budget.repository";
import { CreateBudgetInput, UpdateBudgetInput } from "./budget.schema";
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

export const findAll = async (userId: string) => {
  return findBudget(userId);
};

export const findById = async (budgetId: string, userId: string) => {
  const budget = await findBudgetById(budgetId, userId);

  if (!budget) {
    throw new AppError(404, "Budget not found");
  }

  return budget;
};

export const update = async (
  budgetId: string,
  userId: string,
  data: UpdateBudgetInput,
) => {
  return prisma.$transaction(async (tx) => {
    const existingBudget = await findBudgetById(budgetId, userId, tx);

    if (!existingBudget) {
      throw new AppError(404, "Budget not found");
    }

    const categoryId = data.categoryId ?? existingBudget.categoryId;

    const periodStart = data.periodStart ?? existingBudget.periodStart;

    const periodEnd = data.periodEnd ?? existingBudget.periodEnd;

    if (periodStart >= periodEnd) {
      throw new AppError(400, "Period start must be before period end");
    }

    const category = await findCategoriesById(categoryId, userId, tx);

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
        categoryId,
        periodStart,
        periodEnd,
        excludeBudgetId: budgetId,
      },
      tx,
    );

    if (overlappingBudget) {
      throw new AppError(
        400,
        "A budget already exists for this category during this period",
      );
    }

    const updateData = {
      ...(data.amount !== undefined && {
        amount: new Prisma.Decimal(data.amount),
      }),
      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),
      ...(data.periodStart !== undefined && {
        // updateBudgetRecord expects periodStart as string
        periodStart:
          data.periodStart instanceof Date
            ? data.periodStart.toISOString()
            : (data.periodStart as unknown as string),
      }),
      ...(data.periodEnd !== undefined && {
        // updateBudgetRecord expects periodEnd as string
        periodEnd:
          data.periodEnd instanceof Date
            ? data.periodEnd.toISOString()
            : (data.periodEnd as unknown as string),
      }),
    };

    await updateBudgetRecord(budgetId, userId, updateData, tx);

    return findBudgetById(budgetId, userId, tx);
  });
};

export const remove = async (budgetId: string, userId: string) => {
  const budget = await findBudgetById(budgetId, userId);

  if (!budget) {
    throw new AppError(404, "Budget not found");
  }

  await deleteBudgetRecord(budgetId, userId);
};

import { NextFunction, Request, Response } from "express";
import { createBudgetSchema, updateBudgetSchema } from "./budget.schema";
import * as budgetService from "./budget.service";

export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createBudgetSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        error: result.error.flatten().fieldErrors,
      });
    }

    const budget = await budgetService.create(req.userId, result.data);

    return res.status(201).json({
      status: "success",
      message: "Budget created successfully",
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const budgets = await budgetService.findAll(req.userId);

    return res.status(200).json({ status: "success", data: { budgets } });
  } catch (err) {
    next(err);
  }
};

export const getBudgetById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const budget = await budgetService.findById(req.params.id, req.userId);

    return res.status(200).json({ status: "success", data: budget });
  } catch (err) {
    next(err);
  }
};

export const updateBudget = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = updateBudgetSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        error: result.error.flatten().fieldErrors,
      });
    }

    const budget = await budgetService.update(
      req.params.id,
      req.userId,
      result.data,
    );

    return res.status(200).json({
      status: "success",
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await budgetService.remove(req.params.id, req.userId);

    return res.status(200).json({
      status: "success",
      message: "Budget deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

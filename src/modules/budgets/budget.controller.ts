import { NextFunction, Request, Response } from "express";
import { createBudgetSchema } from "./budget.schema";
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

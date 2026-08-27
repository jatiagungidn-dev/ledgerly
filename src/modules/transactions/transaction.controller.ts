import { Request, Response } from "express";
import { createTransactionSchema } from "./transaction.schema.js";
import * as transactionService from "./transaction.service.js";

export const createTransaction = async (req: Request, res: Response) => {
  const result = createTransactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const transaction = await transactionService.create(req.userId, result.data);

  return res.status(201).json({
    transaction,
  });
};

export const getTransactions = async (req: Request, res: Response) => {
  const transactions = await transactionService.findAll(req.userId);

  return res.status(200).json({
    transactions,
  });
};

export const getTransactionById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const transaction = await transactionService.findById(
    req.params.id,
    req.userId,
  );

  return res.status(200).json({
    transaction,
  });
};

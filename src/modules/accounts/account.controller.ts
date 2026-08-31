import { Request, Response } from "express";
import { createAccountSchema } from "./account.schema.js";
import * as accountService from "./account.service.js";

export const createAccount = async (req: Request, res: Response) => {
  const result = createAccountSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const account = await accountService.create(req.userId, result.data);

  return res.status(201).json({
    account,
  });
};

export const getAccounts = async (req: Request, res: Response) => {
  const accounts = await accountService.findAll(req.userId);

  return res.status(200).json({
    accounts,
  });
};

export const getAccountById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const account = await accountService.findById(req.params.id, req.userId);

  return res.status(200).json({
    account,
  });
};

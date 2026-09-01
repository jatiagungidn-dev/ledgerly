import { NextFunction, Request, Response } from "express";
import { createAccountSchema, updateAccountSchema } from "./account.schema.js";
import * as accountService from "./account.service.js";

export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createAccountSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const account = await accountService.create(req.userId, result.data);

    return res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: { account },
    });
  } catch (err) {
    next(err);
  }
};

export const getAccounts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accounts = await accountService.findAll(_req.userId);

    return res.status(200).json({
      status: "success",
      count: accounts.length,
      data: { accounts },
    });
  } catch (err) {
    next(err);
  }
};

export const getAccountById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const account = await accountService.findById(req.params.id, req.userId);

    return res.status(200).json({
      status: "success",
      data: { account },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAccount = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = updateAccountSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        error: result.error.flatten().fieldErrors,
      });
    }

    const updated = await accountService.update(
      req.params.id,
      req.userId,
      result.data.name!,
    );

    if (!result.data.name) {
      return res.status(400).json({
        status: "fail",
        message: "Account name is required for update",
      });
    }

    console.log(updated);
    return res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      data: { updated },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.remove(req.params.id, req.userId);

    return res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

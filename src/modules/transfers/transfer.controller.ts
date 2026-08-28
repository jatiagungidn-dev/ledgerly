import { Request, Response } from "express";
import { createTransferSchema } from "./transfer.schema";
import * as transferService from "./transfer.service";

export const createTransfer = async (req: Request, res: Response) => {
  const result = createTransferSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const transfer = await transferService.create(req.userId, result.data);
  return res.status(201).json({ transfer });
};

export const getTransfers = async (req: Request, res: Response) => {
  const transfers = await transferService.findAll(req.userId);
  return res.status(200).json({ transfers });
};

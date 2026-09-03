import { NextFunction, Request, Response } from "express";
import { createJournalSchema } from "./journal.schema";
import * as journalService from "./journal.service";

export const createJournal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createJournalSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Invalid request body",
          error: result.error.flatten().fieldErrors,
        });
    }

    const journal = await journalService.create(req.userId, result.data);

    res.status(201).json({
      status: "success",
      message: "Journal created successfully",
      data: { journal },
    });
  } catch (err) {
    next(err);
  }
};

export const getJournals = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const journals = await journalService.getAll(_req.userId);

    res
      .status(200)
      .json({ status: "success", count: journals.length, data: { journals } });
  } catch (err) {
    next(err);
  }
};

export const getJournalById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const journal = await journalService.getById(req.params.id, req.userId);

    res.status(200).json({ status: "success", data: { journal } });
  } catch (err) {
    next(err);
  }
};

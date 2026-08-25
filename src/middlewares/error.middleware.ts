import { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/app-error";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Internal Server Error", err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }

  const message =
    env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  return res.status(500).json({ status: "error", message });
};

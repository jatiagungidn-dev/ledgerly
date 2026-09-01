import { NextFunction, Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { register, login } from "./auth.service";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        error: result.error.flatten().fieldErrors,
      });
    }

    const user = await register(result.data.email, result.data.password);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        error: result.error.flatten().fieldErrors,
      });
    }

    const token = await login(result.data.email, result.data.password);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: { token },
    });
  } catch (err) {
    next(err);
  }
};

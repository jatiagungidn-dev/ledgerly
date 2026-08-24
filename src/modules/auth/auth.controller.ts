import { Request, Response, NextFunction } from "express";
import { registerSchema } from "./auth.schema";
import { register, login } from "./auth.service";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid request body",
      error: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await register(result.data.email, result.data.password);
    return res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid request body",
      error: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const token = await login(result.data.email, result.data.password);

    return res.status(200).json({ token });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIAL") {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }

    next(err);
  }
};

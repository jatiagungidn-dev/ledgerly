import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { register, login } from "./auth.service";

export const registerController = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      error: result.error.flatten().fieldErrors,
    });
  }

  const user = await register(result.data.email, result.data.password);

  return res.status(201).json({ user });
};

export const loginController = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      error: result.error.flatten().fieldErrors,
    });
  }

  const token = await login(result.data.email, result.data.password);

  return res.status(200).json({ token });
};

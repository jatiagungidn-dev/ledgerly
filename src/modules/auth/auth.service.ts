import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail } from "../users/user.repository";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { PublicUser } from "../users/user.types";

export const register = async (
  email: string,
  password: string,
): Promise<PublicUser> => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser(email, passwordHash);

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  const user = await findUserByEmail(email);

  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: "1d" });

  return token;
};

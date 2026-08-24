import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../users/user.repository";

export const register = async (email: string, password: string) => {
  const existingUser = await findUserByEmail(email);

  if(existingUser){
    throw new Error("EMAIL_ALREADY_EXISTS")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await createUser(email, passwordHash)

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
};

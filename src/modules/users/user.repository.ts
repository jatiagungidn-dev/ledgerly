import { Prisma } from "../../generated/prisma";
import { prisma } from "../../config/prisma";
import { PublicUser } from "./user.types";

export const findUserByEmail = async (
  email: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.user.findUnique({ where: { email } });
};

export const findUserById = async (
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PublicUser | null> => {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });
};

export const createUser = async (
  email: string,
  passwordHash: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;
  return client.user.create({ data: { email, passwordHash } });
};

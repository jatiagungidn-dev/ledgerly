import { PrismaClient } from "../generated/prisma/client";

export type PrismaTransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>;

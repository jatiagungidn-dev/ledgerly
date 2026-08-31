import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  currency: z.string().trim().length(3).default("IDR"),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});

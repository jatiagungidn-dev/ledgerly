import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

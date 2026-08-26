import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

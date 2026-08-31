import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" }),
  description: z.string().trim().max(255).optional(),
  accountId: z.string().uuid({ message: "Invalid account ID format" }),
  categoryId: z
    .string()
    .uuid({ message: "Invalid category ID format" })
    .optional(),
  occurredAt: z.coerce.date(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

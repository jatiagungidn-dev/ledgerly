import { z } from "zod";

export const createBudgetSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" }),

  categoryId: z.string().uuid({
    message: "Invalid category ID",
  }),

  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

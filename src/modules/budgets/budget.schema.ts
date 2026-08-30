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

export const updateBudgetSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" })
    .optional(),

  categoryId: z
    .string()
    .uuid({
      message: "Invalid category ID",
    })
    .optional(),

  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

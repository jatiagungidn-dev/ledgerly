import { z } from "zod";

export const createTransferSchema = z.object({
  fromAccountId: z.string().uuid({ message: "Invalid source account ID" }),
  toAccountId: z.string().uuid({ message: "Invalid destination account ID" }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" }),
  description: z.string().trim().max(255).optional(),
  occurredAt: z.coerce.date(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

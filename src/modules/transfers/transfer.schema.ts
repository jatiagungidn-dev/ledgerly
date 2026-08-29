import { z } from "zod";

export const createTransferSchema = z
  .object({
    fromAccountId: z.string().uuid({ message: "Invalid source account ID" }),
    toAccountId: z.string().uuid({ message: "Invalid destination account ID" }),
    amount: z.coerce
      .number()
      .positive({ message: "Amount must be greater than zero" }),
    description: z.string().trim().max(255).optional(),
    occurredAt: z.coerce.date(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and target account cannot be the same",
    path: ["toAccountId"],
  });

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

import { z } from "zod";
import { Prisma } from "../../generated/prisma";

export const ledgerEntrySchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z.string().refine(
    (val) => {
      try {
        const d = new Prisma.Decimal(val);
        return d.isPositive() && !d.isZero();
      } catch {
        return false;
      }
    },
    { message: "Amount must be greater than zero" },
  ),
});

export const createJournalSchema = z
  .object({
    idempotencyKey: z
      .string()
      .trim()
      .min(1, { message: "Idempotency key is required" }),
    description: z
      .string()
      .trim()
      .max(100, { message: "Description can only contain 100 characters" })
      .optional(),
    occurredAt: z.coerce.date(),
    entries: z
      .array(ledgerEntrySchema)
      .min(2, { message: "Journal must have at least 2 entries" }),
  })
  .refine(
    (data) => {
      let totalDebit = new Prisma.Decimal(0);
      let totalCredit = new Prisma.Decimal(0);

      for (const entry of data.entries) {
        const amt = new Prisma.Decimal(entry.amount);
        if (entry.type === "DEBIT") {
          totalDebit = totalDebit.add(amt);
        } else if (entry.type === "CREDIT") {
          totalCredit = totalCredit.add(amt);
        }
      }

      return totalDebit.equals(totalCredit);
    },
    {
      message: "Journal unbalance! Total DEBIT must be balance to total CREDIT",
      path: ["entries"],
    },
  );

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

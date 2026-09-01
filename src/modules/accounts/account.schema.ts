import { z } from "zod";

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name can only contain 100 characters" }),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY"], {
    message: "Account type can only be ASSET, LIABILITY, or EQUITY",
  }),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, {
      message: "Currency code must be 3 ISO characters (eg: IDR, USD)",
    })
    .default("IDR"),
});

export const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name can only contain 100 characters" })
    .optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

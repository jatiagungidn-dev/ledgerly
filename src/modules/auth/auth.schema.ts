import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(72, { message: "Password can only contain 72 characters" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must be at least have 1 capital letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must be at least have 1 number",
    }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

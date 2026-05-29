import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email");
const phoneSchema = z
  .string()
  .trim()
  .min(5, "Enter a valid phone number");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const signInSchema = z.object({
  method: z.enum(["email", "phone"]),
  identifier: z.string().trim().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit reset code"),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(10, "Verification token is required"),
});
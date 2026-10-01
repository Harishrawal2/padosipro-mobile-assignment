import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^(?:\+91|91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (+91 optional)'),
  address: z.string().trim().min(5, 'Address must be at least 5 characters'),
  // Allow empty string or a valid non-empty business name
  businessName: z.union([
    z.string().trim().min(2, 'Business name must be at least 2 characters'),
    z.literal(''),
  ]).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

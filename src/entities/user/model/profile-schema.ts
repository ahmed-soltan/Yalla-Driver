import { z } from 'zod';

export const captainProfileSchema = z.object({
  fullName: z.string().trim().min(3, 'اكتب اسمك بالكامل.'),
  email: z.string().trim().email('اكتب بريدًا إلكترونيًا صحيحًا.').or(z.literal('')),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'اكتب تاريخ الميلاد بصيغة YYYY-MM-DD.')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }, 'اكتب تاريخ ميلاد صحيح.')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 18;
    }, 'يجب أن يكون عمرك 18 سنة على الأقل.'),
  avatarUrl: z.string().trim().url('اكتب رابط صورة صحيح.').or(z.literal('')).optional(),
  gender: z.enum(['MALE', 'FEMALE'], {
    error: 'اختر النوع.',
  }),
});

export type CaptainProfileInput = z.infer<typeof captainProfileSchema>;

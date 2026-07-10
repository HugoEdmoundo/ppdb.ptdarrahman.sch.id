import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
})

export const phoneSchema = z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Nomor telepon tidak valid').optional().or(z.literal(''))

export const nikSchema = z.string().length(16, 'NIK harus 16 digit').optional().or(z.literal(''))
